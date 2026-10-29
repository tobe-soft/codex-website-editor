<?php
declare(strict_types=1);
// Runtime data are PHP-guarded files and are never part of a website build.
const EDITOR_PREFIX = "<?php exit; ?>\n";
function editor_path(): string { return __DIR__ . '/storage/state.php'; }
require_once __DIR__.'/migrations.php';
function editor_default(): array { $seed=editor_migrate_state(is_file(__DIR__.'/content.php')?require __DIR__.'/content.php':['schema'=>1]);$site=json_decode(file_get_contents(__DIR__.'/site-defaults.json'),true,512,JSON_THROW_ON_ERROR);return ['schema'=>editor_release()['dataSchema'],'revision'=>$seed['revision']??0,'blocks'=>$seed['blocks']??[],'globals'=>$seed['globals']??[],'images'=>$seed['images']??[],'links'=>$seed['links']??[],'assets'=>$seed['assets']??[],'pages'=>editor_normalize_pages($seed['pages']??$site['pages']),'menu'=>$seed['menu']??$site['menu'],'admin'=>null,'previous'=>null,'attempts'=>[]]; }
function editor_read(): array {
    $file=editor_path(); if (!is_file($file)) return editor_default();
    $raw=file_get_contents($file); if ($raw===false || !str_starts_with($raw,EDITOR_PREFIX)) throw new RuntimeException('Invalid storage');
    $stored=json_decode(substr($raw,strlen(EDITOR_PREFIX)),true,512,JSON_THROW_ON_ERROR);$stored=editor_migrate_state($stored);$result=array_replace(editor_default(),$stored);
    if(!isset($stored['pages']))foreach($result['pages'] as &$page){$legacy='navigation.'.trim($page['path'],'/');$name=$stored['blocks'][$legacy]['text']??null;if(is_string($name)&&trim($name)!==''&&strlen($name)<=160)$page['name']=trim($name);}unset($page);$result['pages']=editor_normalize_pages($result['pages']);return $result;
}
function editor_write(array $state): void {
    $dir=dirname(editor_path()); if (!is_dir($dir) && !mkdir($dir,0700,true)) throw new RuntimeException('Storage unavailable');
    $tmp=tempnam($dir,'state-'); if ($tmp===false) throw new RuntimeException('Storage unavailable');
    try { if(file_put_contents($tmp,EDITOR_PREFIX.json_encode($state,JSON_THROW_ON_ERROR|JSON_UNESCAPED_UNICODE))===false) throw new RuntimeException('Write failed'); chmod($tmp,0600); if(!rename($tmp,editor_path()))throw new RuntimeException('Write failed'); }
    finally { if(is_file($tmp))unlink($tmp); }
}
function editor_session(): void {
    if(session_status()===PHP_SESSION_ACTIVE)return;
    ini_set('session.use_strict_mode','1'); ini_set('session.use_only_cookies','1');
    session_name(editor_config()['sessionName']); session_set_cookie_params(['lifetime'=>0,'path'=>editor_url('/'),'secure'=>!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off','httponly'=>true,'samesite'=>'Strict']); session_start();
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}
function editor_authenticated(array $state): bool {
    return isset($_SESSION['epoch'],$state['admin']['epoch']) && hash_equals($state['admin']['epoch'],$_SESSION['epoch']) && time()-($_SESSION['active']??0)<1800 && time()-($_SESSION['started']??0)<28800;
}
function editor_text(string $id): string {
    global $editorState,$editorRegistry;
    if(isset($editorState['blocks'][$id]['text']))return nl2br(htmlspecialchars($editorState['blocks'][$id]['text'],ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8'),false);
    return $editorRegistry[$id]['html']??'';
}
function editor_element(string $id,string $originalTag,array $attributes,string $defaultCategory): string {
 global $editorState;
 $category=$editorState['blocks'][$id]['category']??$defaultCategory;
 $heading=preg_match('/^h[1-6]$/D',$category)===1;
 $tag=$originalTag;
 if(preg_match('/^(h[1-6]|p)$/D',$originalTag))$tag=$heading?$category:(preg_match('/^h[1-6]$/D',$originalTag)?'p':$originalTag);
 $attrs=[];foreach($attributes as $attribute)$attrs[$attribute['name']]=$attribute['value'];
 $attrs['data-text-style']=$category;$attrs['data-default-text-style']=$defaultCategory;
 if($heading&&!preg_match('/^h[1-6]$/D',$tag)&&$tag!=='li'){$attrs['role']='heading';$attrs['aria-level']=substr($category,1);}
 $html=editor_text($id);
 $html=str_replace('data-text-style="'.$defaultCategory.'"','data-text-style="'.$category.'"',$html);
 if($heading&&$tag==='li')$html='<span role="heading" aria-level="'.substr($category,1).'">'.$html.'</span>';
 $result='<'.$tag;foreach($attrs as $name=>$value)$result.=' '.$name.'="'.htmlspecialchars($value,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8').'"';
 return $result.'>'.$html.'</'.$tag.'>';
}
function editor_style_properties(array $style): string {
    $result=''; foreach(['color'=>'color','size'=>'font-size','font'=>'font-family'] as $key=>$property){
        if(!isset($style[$key]))continue;
        $value=$style[$key]; if($key==='size')$value.='px';
        if($key==='font')$value=['sans'=>'Arial, sans-serif','serif'=>'Georgia, serif','mono'=>'Courier New, monospace'][$value];
        $result.="$property:$value!important;";
    } return $result;
}
function editor_categories(): array { return json_decode(file_get_contents(__DIR__.'/text-styles.json'),true,512,JSON_THROW_ON_ERROR); }
function editor_category_counts(): array {
 global $editorRegistry,$editorState;$counts=array_fill_keys(array_keys(editor_categories()),0);
 foreach($editorRegistry as $id=>$field)foreach(isset($editorState['blocks'][$id]['category'])?[$editorState['blocks'][$id]['category']]:($field['categories']??[$field['category']??$field['type']]) as $key)if(isset($counts[$key]))$counts[$key]++;
 foreach($editorState['pages'] as $page)if(empty($page['deleted'])&&(!empty($page['showInMenu'])||!empty($page['showInFooter'])))$counts['nav']++;
 return $counts;
}
function editor_styles(): string {
    global $editorState; $css='';
    foreach($editorState['globals'] as $type=>$style){$selector='body [data-text-style="'.$type.'"]';$css.=$selector.'{'.editor_style_properties($style).'}';}
    foreach($editorState['blocks'] as $id=>$block)if(!empty($block['style'])){ $selector='body [data-edit-id="'.$id.'"]';$css.=$selector.','.$selector.' :is(span,em,strong){'.editor_style_properties($block['style']).'}'; }
    return editor_menu_styles().'<style id="editor-published-styles">'.$css.'</style>';
}
function editor_controls(): string {
    if(!isset($_COOKIE[editor_config()['sessionName']]))return '';
    editor_session(); global $editorState;
    if(!editor_authenticated($editorState))return '';
    $_SESSION['active']=time();
    return editor_public_html('<link rel="stylesheet" href="/site-editor/editor.css?v=7"><script src="/site-editor/editor.js?v=7" defer></script><script src="/site-editor/media.js?v=1" defer></script>');
}
$editorRegistry=is_file(__DIR__.'/registry.php')?require __DIR__.'/registry.php':[];
$editorAssets=is_file(__DIR__.'/asset-registry.php')?require __DIR__.'/asset-registry.php':['images'=>[],'links'=>[]];
require_once __DIR__.'/media-runtime.php';
require_once __DIR__.'/site-runtime.php';
$editorState=editor_read();editor_register_page_fields();
// Headers must be set before any page output.
if(isset($_COOKIE[editor_config()['sessionName']])) { editor_session(); header('Cache-Control: private, no-store'); }

<?php
declare(strict_types=1);
function editor_page(string $path): ?array {global $editorState;foreach($editorState['pages'] as $page)if($page['path']===$path)return $page;return null;}
function editor_not_found(): never {http_response_code(404);require __DIR__.'/../404.php';exit;}
function editor_page_guard(string $path): void {if($path==='/404.php')return;$page=editor_page($path);if($page&&!empty($page['deleted']))editor_not_found();}
function editor_page_name(string $path): ?string {$p=editor_page($path);return $p&&!empty($p['name'])?$p['name']:null;}
function editor_page_title(string $path,string $original): string {
    $name=editor_page_name($path);$defaults=json_decode(file_get_contents(__DIR__.'/site-defaults.json'),true);
    foreach($defaults['pages'] as $p)if($p['path']===$path&&$name===$p['name'])return htmlspecialchars($original,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');
    return htmlspecialchars($name?$name.' | '.editor_config()['name']:$original,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');
}
function editor_page_json(string $path,string $original): string {
    $data=json_decode($original,true);if(!is_array($data))return '{}';$name=editor_page_name($path);
    if($name)foreach($data['@graph']??[] as $index=>$entry){if(($entry['@type']??'')==='WebPage')$data['@graph'][$index]['name']=$name;if(($entry['@type']??'')==='BreadcrumbList'){ $last=count($entry['itemListElement']??[])-1;if($last>=0)$data['@graph'][$index]['itemListElement'][$last]['name']=$name;}}
    return json_encode($data,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_UNICODE);
}
function editor_custom_metadata(array $page): string {return json_encode(['@context'=>'https://schema.org','@type'=>'WebPage','name'=>$page['name'],'url'=>editor_config()['origin'].editor_url($page['path']),'inLanguage'=>editor_config()['language']],JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_UNICODE);}
function editor_page_description(array $page): string {return htmlspecialchars(substr(preg_replace('/\s+/u',' ',$page['intro']),0,180),ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
function editor_navigation(bool $footer=false): string {
    global $editorState;$html='';$current=editor_request_path();
    foreach($editorState['pages'] as $page){if(!empty($page['deleted']))continue;if($footer?empty($page['showInFooter']):empty($page['showInMenu']))continue;
        $attrs=['href'=>$page['path'],'data-text-style'=>'nav','data-nav-page'=>$page['id']];if($current===$page['path'])$attrs['aria-current']='page';
        $html.='<a'.editor_attributes($attrs).'>'.htmlspecialchars($page['name'],ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8').'</a>';
    }return $html;
}
function editor_menu_settings(): array {global $editorState;$menu=$editorState['menu'];$menu['fontSize']=$editorState['globals']['nav']['size']??$menu['fontSize'];return $menu;}
function editor_menu_styles(): string {
    $m=editor_menu_settings();$size=max(14,min(22,(int)$m['fontSize']));$gap=(int)$m['gap'];$radius=(int)$m['radius'];$border=(int)$m['border'];
    $plain=$m['design']==='plain';$padding=$plain?'0':max(8,(int)round($size*.55)).'px';$stroke=$plain?'0':$border.'px solid #a8bcd4';$round=$plain?'0':$radius.'px';
    $extra='.header nav a:focus-visible{outline:3px solid #357ac7;outline-offset:3px}';if(!$plain)$extra.='.header .desktop-nav a:not([aria-current]),.header .mobile-nav nav a:not([aria-current]){background:#f7f9fc}';
    return editor_public_html('<style>'.$extra.'.header .desktop-nav{gap:clamp(8px,1.8vw,'.$gap.'px);flex-wrap:nowrap;white-space:nowrap;font-size:'.$size.'px}.header .desktop-nav a,.header .mobile-nav nav a{display:inline-flex;align-items:center;min-height:44px;box-sizing:border-box;padding:6px '.$padding.';border:'.$stroke.';border-radius:'.$round.';text-decoration:none}.header .mobile-nav nav a{display:flex;width:100%;white-space:normal;overflow-wrap:anywhere;padding:10px 12px;margin:4px 0}.header .mobile-nav nav{max-height:70dvh;overflow-y:auto;width:min(300px,calc(100vw - 40px))}.header .desktop-nav a[aria-current],.header .mobile-nav nav a[aria-current]{background:'.($plain?'transparent':'#eaf1fa').';color:#316ba5}.header.nav-overflow .desktop-nav{display:none}.header.nav-overflow .mobile-nav{display:block;position:relative;grid-column:2;grid-row:1}.header.nav-overflow .nav-row{display:grid;grid-template-columns:1fr auto;gap:12px 20px;padding:15px 0 18px}.header.nav-overflow .brand{grid-column:1;grid-row:1}.header.nav-overflow .nav-contact{grid-column:1/-1;grid-row:2;justify-self:start}.header.nav-overflow .mobile-nav summary{cursor:pointer;list-style:none;border:1px solid #d0dceb;border-radius:7px;padding:9px 14px;font-size:16px}.header.nav-overflow .mobile-nav nav{position:absolute;right:0;top:50px;z-index:10;background:#fff;border:1px solid #d0dceb;border-radius:10px;padding:10px;box-shadow:0 15px 25px #0a316815}</style><script src="/site-editor/navigation.js?v=1" defer></script>');
}
function editor_apply_site(array $input,array &$next): void {
    global $editorState;
    if($input['scope']==='menu'){
        $m=$input['menu']??null;if(!is_array($m)||!in_array($m['design']??null,['plain','rounded'],true))respond(422,['error'=>'Ungültiges Menüdesign.']);
        foreach(['fontSize'=>[14,22],'gap'=>[8,28],'border'=>[0,3],'radius'=>[6,20]] as $key=>[$min,$max])if(!is_int($m[$key]??null)||$m[$key]<$min||$m[$key]>$max)respond(422,['error'=>'Menüwerte liegen außerhalb des erlaubten Bereichs.']);
        $next['menu']=array_intersect_key($m,array_flip(['design','fontSize','gap','border','radius']));$next['globals']['nav']['size']=$m['fontSize'];return;
    }
    $inputPages=$input['pages']??null;if(!is_array($inputPages)||!array_is_list($inputPages)||count($inputPages)>40)respond(422,['error'=>'Maximal 40 Seiten sind möglich.']);
    $existing=[];foreach($editorState['pages'] as $p)$existing[$p['id']]=$p;
    $pages=[];$ids=[];$paths=[];
    foreach($inputPages as $p){
        if(!is_array($p)||!is_string($p['id']??null)||isset($ids[$p['id']])||!is_string($p['name']??null)||trim($p['name'])===''||strlen($p['name'])>160||preg_match('/[\x00-\x1f\x7f]/',$p['name'])||!is_bool($p['showInMenu']??null)||(array_key_exists('showInFooter',$p)&&!is_bool($p['showInFooter'])))respond(422,['error'=>'Seitennamen und Menüauswahl prüfen.']);
        $id=$p['id'];$old=$existing[$id]??null;
        if($old){$path=$old['path'];$page=$old;unset($page['deleted']);}
        else{
            $path=$p['path']??'';
            if(!preg_match('/^page-[a-f0-9]{16}$/D',$id)||!is_string($path)||!preg_match('~^/[a-z0-9][a-z0-9-]{0,59}/$~D',$path)||in_array(trim($path,'/'),['site-editor','page-template','_astro','404','services','impressum-2','datenschutzerklaerung'],true))respond(422,['error'=>'Ungültige oder reservierte Seitenadresse.']);
            foreach($existing as $e)if($e['path']===$path)respond(422,['error'=>'Diese Seitenadresse ist bereits vergeben.']);
            $page=['id'=>$id,'path'=>$path,'builtin'=>false];
        }
        if(isset($paths[$path]))respond(422,['error'=>'Seitenadressen müssen eindeutig sein.']);
        $page['name']=trim($p['name']);$page['showInMenu']=$p['showInMenu'];$page['showInFooter']=$p['showInFooter']??($old['showInFooter']??false);
        if(empty($page['builtin']))foreach(['intro','body'] as $key){if(!is_string($p[$key]??null)||strlen($p[$key])>12000)respond(422,['error'=>'Seiteninhalt ist ungültig oder zu lang.']);$page[$key]=$p[$key];if($old&&($old[$key]??null)!==$p[$key]&&isset($next['blocks']['page.'.$id.'.'.$key]))$next['blocks']['page.'.$id.'.'.$key]['text']=$p[$key];}
        $pages[]=$page;$ids[$id]=true;$paths[$path]=true;
    }
    foreach($existing as $id=>$page)if(!isset($ids[$id])){if(!empty($page['protected']))respond(422,['error'=>'Die Startseite kann nicht gelöscht werden.']);$page['deleted']=true;$page['showInMenu']=false;$page['showInFooter']=false;$pages[]=$page;}
    $next['pages']=$pages;
}
function editor_register_page_fields(): void {
    global $editorState,$editorRegistry;
    foreach($editorState['pages'] as $page){if(!empty($page['builtin'])||!empty($page['deleted']))continue;foreach(['heading'=>['h1',$page['name']],'intro'=>['p',$page['intro']],'body'=>['p',$page['body']]] as $key=>[$type,$text]){$id='page.'.$page['id'].'.'.$key;$editorRegistry[$id]=['type'=>$type,'category'=>$type,'categories'=>[$type],'html'=>nl2br(htmlspecialchars($text,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8'),false)];}}
}
function editor_page_content(array $page): string {
    $html='<section class="page-hero"><div class="container">'.editor_element('page.'.$page['id'].'.heading','h1',[['name'=>'data-edit-id','value'=>'page.'.$page['id'].'.heading']],'h1');
    $html.=editor_element('page.'.$page['id'].'.intro','p',[['name'=>'class','value'=>'lead'],['name'=>'data-edit-id','value'=>'page.'.$page['id'].'.intro']],'p').'</div></section><section class="section"><div class="container prose">';
    return $html.editor_element('page.'.$page['id'].'.body','p',[['name'=>'data-edit-id','value'=>'page.'.$page['id'].'.body']],'p').'</div></section>';
}

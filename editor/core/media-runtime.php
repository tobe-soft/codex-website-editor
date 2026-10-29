<?php
declare(strict_types=1);
function editor_attributes(array $attributes): string {
    $result='';foreach($attributes as $name=>$value)$result.=' '.$name.'="'.htmlspecialchars((string)$value,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8').'"';return $result;
}
function editor_attr_map(array $attributes): array { $result=[];foreach($attributes as $attr)$result[$attr['name']]=$attr['value'];return $result; }
function editor_gallery(): array {
    global $editorAssets,$editorState;$gallery=[];
    $labels=['brand.logo'=>'Firmenlogo','index.hero.image'=>'Startseite – Hauptbild','about.hero.image'=>'Über uns – Hauptbild','contact.hero.image'=>'Kontakt – Hauptbild','fernwartung.hero.image'=>'Fernwartung – Hauptbild'];
    foreach($editorAssets['images'] as $id=>$entry){$attrs=editor_attr_map($entry['attrs']);$src=$attrs['src'];$gallery[$src]=['src'=>$src,'label'=>$labels[$id]??$id,'width'=>(int)($attrs['width']??0),'height'=>(int)($attrs['height']??0)];}
    foreach($editorState['assets'] as $src=>$asset)$gallery[$src]=$asset;
    return array_values($gallery);
}
function editor_image(string $id,array $attributes): string {
    global $editorState;$attrs=editor_attr_map($attributes);$image=$editorState['images'][$id]??null;
    if($image){$attrs['src']=$image['src'];$attrs['alt']=$image['alt'];$attrs['width']=$image['width'];$attrs['height']=$image['height'];unset($attrs['srcset'],$attrs['sizes']);}
    $attrs['data-edit-image']=$id;return '<img'.editor_attributes($attrs).'>';
}
function editor_link_open(string $id,array $attributes): string {
    global $editorState;$attrs=editor_attr_map($attributes);$link=$editorState['links'][$id]??null;
    if($link){$attrs['href']=$link['href'];if($link['newTab']){$attrs['target']='_blank';$attrs['rel']=trim(($attrs['rel']??'').' noopener noreferrer');}else unset($attrs['target']);if(isset($link['text'])){unset($attrs['aria-label']);}}
    $attrs['data-edit-link']=$id;return '<a'.editor_attributes($attrs).'>';
}
function editor_link_label(string $id): string {
    global $editorState,$editorAssets;
    if(isset($editorState['links'][$id]['text']))return htmlspecialchars($editorState['links'][$id]['text'],ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');
    return $editorAssets['links'][$id]['html'];
}
function editor_valid_href(mixed $value): bool {
    if(!is_string($value)||strlen($value)>2048||preg_match('/[\x00-\x20\x7f\\\\]/',$value))return false;
    if(preg_match('~^https?://~i',$value))return filter_var($value,FILTER_VALIDATE_URL)!==false;
    if(str_starts_with($value,'/')&&!str_starts_with($value,'//'))return true;
    if(preg_match('/^#[a-zA-Z0-9_.:-]+$/D',$value))return true;
    if(str_starts_with($value,'tel:'))return preg_match('/^tel:\+?[0-9().-]{3,40}$/D',$value)===1;
    if(str_starts_with($value,'mailto:')){[$address,$query]=array_pad(explode('?',substr($value,7),2),2,'');return filter_var($address,FILTER_VALIDATE_EMAIL)!==false&&!preg_match('/%0[ad]/i',$query);}
    return false;
}
function editor_apply_media(array $input,array &$next): void {
    global $editorAssets;
    $scope=$input['scope'];$id=$input['id']??'';
    if(!is_string($id)||!isset($editorAssets[$scope==='image'?'images':'links'][$id]))respond(422,['error'=>'Element nicht vorhanden.']);
    if(!empty($input['reset'])){unset($next[$scope==='image'?'images':'links'][$id]);return;}
    if($scope==='image'){
        $found=null;foreach(editor_gallery() as $asset)if($asset['src']===($input['src']??null))$found=$asset;
        $alt=$input['alt']??'';if(!$found||!is_string($alt)||strlen($alt)>600)respond(422,['error'=>'Bild oder Alternativtext ist ungültig.']);
        $next['images'][$id]=['src'=>$found['src'],'alt'=>$alt,'width'=>$found['width'],'height'=>$found['height']];
    }else{
        if(!editor_valid_href($input['href']??null)||!is_bool($input['newTab']??null))respond(422,['error'=>'Bitte ein gültiges Linkziel angeben.']);
        $link=['href'=>$input['href'],'newTab'=>$input['newTab']];if(isset($next['links'][$id]['text']))$link['text']=$next['links'][$id]['text'];$entry=$editorAssets['links'][$id];
        if(array_key_exists('text',$input)){
            if(!is_string($input['text'])||strlen($input['text'])>2000||trim($input['text'])==='')respond(422,['error'=>'Bitte eine Linkbeschriftung eingeben.']);
            if($entry['labelId']){$next['blocks'][$entry['labelId']]??=['style'=>[]];$next['blocks'][$entry['labelId']]['text']=$input['text'];}
            elseif($entry['canText'])$link['text']=$input['text'];else respond(422,['error'=>'Dieses Linkelement enthält mehrere Inhalte.']);
        }
        $next['links'][$id]=$link;
    }
}
function editor_content_snapshot(array $state): array {return ['blocks'=>$state['blocks'],'globals'=>$state['globals'],'images'=>$state['images'],'links'=>$state['links'],'pages'=>$state['pages']??json_decode(file_get_contents(__DIR__.'/site-defaults.json'),true)['pages'],'menu'=>$state['menu']??json_decode(file_get_contents(__DIR__.'/site-defaults.json'),true)['menu']];}
function editor_upload_limit(): int {
    $parse=static function(string $s): int {$s=trim($s);$unit=strtolower(substr($s,-1));return (int)$s*match($unit){'g'=>1073741824,'m'=>1048576,'k'=>1024,default=>1};};
    $limits=[5242880];foreach(['upload_max_filesize','post_max_size'] as $key){$n=$parse((string)ini_get($key));if($n>0)$limits[]=$n;}return min($limits);
}

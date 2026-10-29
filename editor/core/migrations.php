<?php
declare(strict_types=1);
function editor_release(): array {
    static $release;
    return $release??=json_decode(file_get_contents(__DIR__.'/release.json'),true,512,JSON_THROW_ON_ERROR);
}
function editor_config(): array {
    static $config;
    return $config??=json_decode(file_get_contents(__DIR__.'/site-config.json'),true,512,JSON_THROW_ON_ERROR);
}
function editor_normalize_pages(array $pages): array {
    foreach($pages as &$page)if(!array_key_exists('showInFooter',$page))$page['showInFooter']=empty($page['deleted'])&&in_array($page['id'],['impressum','privacy'],true);
    return $pages;
}
// Pure, idempotent migration. Reading never writes or changes a content revision.
// Authentication, uploaded assets, unknown fields and individual styles survive.
function editor_migrate_state(array $state): array {
    $schema=$state['schema']??1;$release=editor_release();
    if(!is_int($schema)||$schema<$release['minimumDataSchema']||$schema>$release['dataSchema'])throw new RuntimeException('Unsupported editor data schema');
    if($schema===1){
        if(isset($state['pages']))$state['pages']=editor_normalize_pages($state['pages']);
        if(isset($state['previous']['pages']))$state['previous']['pages']=editor_normalize_pages($state['previous']['pages']);
        $state['schema']=2;
    }
    if(($state['schema']??null)!==$release['dataSchema'])throw new RuntimeException('Missing editor migration');
    return $state;
}

// Content paths stay installation-relative so moving a site needs no data migration.
function editor_url(string $path): string {
 $base=editor_config()['basePath']??'';
 if($base===''||!str_starts_with($path,'/')||str_starts_with($path,'//')||$path===$base||str_starts_with($path,$base.'/'))return $path;
 return $base.$path;
}
function editor_request_path(): string {
 $path=parse_url($_SERVER['REQUEST_URI']??'/',PHP_URL_PATH);$base=editor_config()['basePath']??'';
 if($base!==''&&($path===$base||str_starts_with($path,$base.'/')))$path=substr($path,strlen($base))?:'/';
 return $path;
}
function editor_public_html(string $html): string {
 return preg_replace_callback('~((?:href|src|action)=["\'])(/[^"\']*)~',fn($m)=>$m[1].editor_url($m[2]),$html);
}

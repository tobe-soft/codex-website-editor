<?php
// Local PHP development router; Apache uses public/.htaccess in production.
$root=realpath(__DIR__.'/../dist');
$path=rawurldecode(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH));
if(str_contains($path,"\0")||preg_match('~(?:^|/)\.~',$path)||preg_match('~^/site-editor/(?:storage|uploads)/.*\.php$~',$path)||preg_match('~^/site-editor/(?:registry|asset-registry|bootstrap|runtime|media-runtime|site-runtime|page-shell|content|migrations)\.php$~',$path)){http_response_code(403);exit;}
$target=realpath($root.$path);
if($target!==false&&($target===$root||str_starts_with($target,$root.DIRECTORY_SEPARATOR))){
 if(is_dir($target)&&is_file($target.'/index.php')){require $target.'/index.php';return true;}
 if(is_file($target))return false;
}
require $root.'/site-editor/site.php';

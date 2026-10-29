<?php
// Local PHP development router; Apache uses public/.htaccess in production.
$root=realpath(__DIR__.'/../dist');
$path=rawurldecode(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH));
$config=json_decode(file_get_contents($root.'/site-editor/site-config.json'),true);$base=$config['basePath']??'';
if($base!==''&&!($path===$base||str_starts_with($path,$base.'/'))){http_response_code(404);exit;}
if($base!==''&&$path===$base){header('Location: '.$base.'/',true,301);exit;}
if($base!=='')$path=substr($path,strlen($base))?:'/';
if(str_contains($path,"\0")||preg_match('~(?:^|/)\.~',$path)||preg_match('~^/site-editor/(?:storage|uploads)/.*\.php$~',$path)||preg_match('~^/site-editor/(?:registry|asset-registry|bootstrap|runtime|media-runtime|site-runtime|page-shell|content|migrations)\.php$~',$path)){http_response_code(403);exit;}
$target=realpath($root.$path);
if($target!==false&&($target===$root||str_starts_with($target,$root.DIRECTORY_SEPARATOR))){
 if(is_dir($target)&&is_file($target.'/index.php')){require $target.'/index.php';return true;}
 if(is_file($target)){
 if($base==='')return false;
 if(str_ends_with($target,'.php')){require $target;return true;}
 $ext=pathinfo($target,PATHINFO_EXTENSION);header('Content-Type: '.(['css'=>'text/css','js'=>'text/javascript','svg'=>'image/svg+xml','png'=>'image/png','json'=>'application/json'][$ext]??'application/octet-stream'));readfile($target);return true;
}
}
require $root.'/site-editor/site.php';

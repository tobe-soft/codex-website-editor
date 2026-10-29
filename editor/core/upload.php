<?php
declare(strict_types=1);
require __DIR__.'/runtime.php';
header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');
function upload_reply(int $status,array $data): never {http_response_code($status);echo json_encode($data,JSON_UNESCAPED_UNICODE);exit;}
editor_session();
if($_SERVER['REQUEST_METHOD']!=='POST')upload_reply(405,['error'=>'Methode nicht erlaubt.']);
$state=editor_read();if(!editor_authenticated($state))upload_reply(401,['error'=>'Bitte anmelden.']);
if(!hash_equals($_SESSION['csrf'],(string)($_POST['csrf']??'')))upload_reply(403,['error'=>'Sitzung abgelaufen oder Upload zu groß. Bitte neu laden.']);
if(isset($_SERVER['HTTP_ORIGIN'])&&parse_url($_SERVER['HTTP_ORIGIN'],PHP_URL_HOST)!==explode(':',$_SERVER['HTTP_HOST'])[0])upload_reply(403,['error'=>'Anfrage nicht erlaubt.']);
$file=$_FILES['image']??null;
if(!$file||$file['error']!==UPLOAD_ERR_OK||$file['size']<1||$file['size']>editor_upload_limit()||!is_uploaded_file($file['tmp_name']))upload_reply(422,['error'=>'Bild konnte nicht hochgeladen werden. Dateigröße und Serverlimit prüfen.']);
if(!class_exists('finfo'))upload_reply(503,['error'=>'Der Server benötigt die PHP-Dateityperkennung für Bild-Uploads.']);
$mime=(new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);$extensions=['image/png'=>'png','image/jpeg'=>'jpg','image/webp'=>'webp'];$size=@getimagesize($file['tmp_name']);
if(!isset($extensions[$mime])||!$size||($size['mime']??'')!==$mime||$size[0]<1||$size[1]<1||$size[0]>16000||$size[1]>16000||$size[0]*$size[1]>24000000)upload_reply(422,['error'=>'Erlaubt sind gültige PNG-, JPG- und WebP-Bilder mit höchstens 24 Megapixeln.']);
$dir=__DIR__.'/uploads';if(!is_dir($dir)&&!mkdir($dir,0755,true))upload_reply(503,['error'=>'Bildspeicher ist nicht verfügbar.']);
$name=bin2hex(random_bytes(16)).'.'.$extensions[$mime];$path=$dir.'/'.$name;
$lock=fopen(dirname(editor_path()).'/lock.php','c+');if(!$lock||!flock($lock,LOCK_EX))upload_reply(503,['error'=>'Speicher ist nicht verfügbar.']);
try{
    $state=editor_read();if(!editor_authenticated($state))upload_reply(401,['error'=>'Bitte erneut anmelden.']);
    if(!move_uploaded_file($file['tmp_name'],$path))throw new RuntimeException('Upload move failed');chmod($path,0644);
    $src=editor_url('/site-editor/uploads/'.$name);$asset=['src'=>$src,'label'=>substr(preg_replace('/[\x00-\x1f\x7f]/','',basename($file['name'])),0,160),'width'=>$size[0],'height'=>$size[1]];
    $state['assets'][$src]=$asset;editor_write($state);$_SESSION['active']=time();upload_reply(200,['asset'=>$asset]);
}catch(Throwable $e){if(is_file($path))unlink($path);error_log('Image upload: '.$e->getMessage());upload_reply(500,['error'=>'Bild konnte nicht gespeichert werden.']);}

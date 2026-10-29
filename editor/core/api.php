<?php
declare(strict_types=1);
require __DIR__.'/runtime.php';
header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store'); header('X-Content-Type-Options: nosniff');
function respond(int $code,array $data): never { http_response_code($code); echo json_encode($data,JSON_UNESCAPED_UNICODE); exit; }
function check_style(mixed $style): array {
 if(!is_array($style)||array_diff(array_keys($style),['color','size','font']))respond(422,['error'=>'Ungültige Gestaltung.']);
 foreach($style as $key=>$value){
  if($key==='color'&&(!is_string($value)||!preg_match('/^#[0-9a-fA-F]{6}$/D',$value)))respond(422,['error'=>'Ungültige Farbe.']);
  if($key==='size'&&(!is_int($value)||$value<10||$value>120))respond(422,['error'=>'Schriftgröße: 10 bis 120 Pixel.']);
  if($key==='font'&&!in_array($value,['sans','serif','mono'],true))respond(422,['error'=>'Ungültige Schriftart.']);
 } return $style;
}
editor_session();
$dir=dirname(editor_path()); if(!is_dir($dir)&&!mkdir($dir,0700,true))respond(503,['error'=>'Speicher nicht verfügbar.']);
$lock=fopen($dir.'/lock.php','c+'); if(!$lock||!flock($lock,LOCK_EX))respond(503,['error'=>'Speicher nicht verfügbar.']);
try {
 $state=editor_read();
 if($_SERVER['REQUEST_METHOD']==='GET'){
  $auth=editor_authenticated($state);
  if($auth)$_SESSION['active']=time();
  respond(200,['authenticated'=>$auth,'setup'=>empty($state['admin']),'csrf'=>$_SESSION['csrf'],'revision'=>$state['revision'],'blocks'=>$auth?$state['blocks']:new stdClass(),'globals'=>$auth?$state['globals']:new stdClass(),'previous'=>$auth&&!empty($state['previous']),'schema'=>$state['schema'],'coreVersion'=>$auth?editor_release()['version']:null,'siteId'=>$auth?editor_config()['id']:null,'categories'=>$auth?editor_categories():new stdClass(),'categoryCounts'=>$auth?editor_category_counts():new stdClass(),'images'=>$auth?$state['images']:new stdClass(),'links'=>$auth?$state['links']:new stdClass(),'assets'=>$auth?$state['assets']:new stdClass(),'media'=>$auth?$editorAssets:new stdClass(),'gallery'=>$auth?editor_gallery():[],'uploadLimit'=>editor_upload_limit(),'pages'=>$auth?$state['pages']:[],'menu'=>$auth?editor_menu_settings():new stdClass()]);
 }
 if($_SERVER['REQUEST_METHOD']!=='POST')respond(405,['error'=>'Methode nicht erlaubt.']);
 if(($_SERVER['CONTENT_LENGTH']??0)>1048576)respond(413,['error'=>'Änderung zu groß.']);
 $origin=$_SERVER['HTTP_ORIGIN']??'';
 if($origin!=='' && parse_url($origin,PHP_URL_HOST)!==explode(':',$_SERVER['HTTP_HOST'])[0])respond(403,['error'=>'Anfrage nicht erlaubt.']);
 $input=json_decode(file_get_contents('php://input'),true,32,JSON_THROW_ON_ERROR);
 if(!is_array($input)||!hash_equals($_SESSION['csrf'],(string)($input['csrf']??'')))respond(403,['error'=>'Sitzung abgelaufen. Bitte neu laden.']);
 $action=$input['action']??'';
 if(in_array($action,['login','setup'],true)){
  $ip=hash('sha256',$_SERVER['REMOTE_ADDR']??'unknown'); $attempt=$state['attempts'][$ip]??['count'=>0,'time'=>time()];
  if(time()-$attempt['time']>900)$attempt=['count'=>0,'time'=>time()];
  if($attempt['count']>=8)respond(429,['error'=>'Zu viele Versuche. Bitte in 15 Minuten erneut versuchen.']);
  $password=$input['password']??''; if(!is_string($password)||strlen($password)>72)respond(422,['error'=>'Passwort ist ungültig (maximal 72 Bytes).']);
  if($action==='setup'){
   $bootstrap=is_file(__DIR__.'/bootstrap.php')?require __DIR__.'/bootstrap.php':null;
   $valid=empty($state['admin'])&&is_string($bootstrap)&&hash_equals($bootstrap,hash('sha256',(string)($input['key']??'')));
   if($valid&&strlen($password)<14)respond(422,['error'=>'Bitte mindestens 14 Zeichen verwenden.']);
  }else $valid=!empty($state['admin'])&&password_verify($password,$state['admin']['hash']);
  if(!$valid){$attempt['count']++;$state['attempts'][$ip]=$attempt;editor_write($state);respond(401,['error'=>'Anmeldung nicht möglich. Zugangsdaten prüfen.']);}
  if($action==='setup')$state['admin']=['hash'=>password_hash($password,PASSWORD_DEFAULT),'epoch'=>bin2hex(random_bytes(24))];
  $state['attempts']=array_filter($state['attempts'],fn($a)=>time()-$a['time']<900);unset($state['attempts'][$ip]);editor_write($state);
  session_regenerate_id(true); $_SESSION['epoch']=$state['admin']['epoch'];$_SESSION['started']=$_SESSION['active']=time();$_SESSION['csrf']=bin2hex(random_bytes(32));respond(200,['ok'=>true]);
 }
 if(!editor_authenticated($state))respond(401,['error'=>'Bitte erneut anmelden.']); $_SESSION['active']=time();
 if($action==='logout'){$_SESSION=[];session_destroy();setcookie(session_name(),'', ['expires'=>time()-3600,'path'=>editor_url('/'),'secure'=>!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off','httponly'=>true,'samesite'=>'Strict']);respond(200,['ok'=>true]);}
 if($action==='password'){
  if(!password_verify((string)($input['current']??''),$state['admin']['hash']))respond(422,['error'=>'Bisheriges Passwort stimmt nicht.']);
  $password=$input['password']??'';if(!is_string($password)||strlen($password)<14||strlen($password)>72)respond(422,['error'=>'Neues Passwort: 14 Zeichen bis maximal 72 Bytes.']);
  $state['admin']=['hash'=>password_hash($password,PASSWORD_DEFAULT),'epoch'=>bin2hex(random_bytes(24))];editor_write($state);$_SESSION['epoch']=$state['admin']['epoch'];session_regenerate_id(true);respond(200,['ok'=>true]);
 }
 if(!in_array($action,['publish','restore'],true))respond(422,['error'=>'Unbekannte Aktion.']);
 if(($input['revision']??null)!==$state['revision'])respond(409,['error'=>'Inzwischen wurde eine andere Änderung veröffentlicht. Seite neu laden.']);
 $next=editor_content_snapshot($state);
 if($action==='restore'){
  if(empty($state['previous']))respond(422,['error'=>'Kein vorheriger Stand vorhanden.']);$next=$state['previous'];
 } else {
  $scope=$input['scope']??'block';$id=$input['id']??'';
  if(in_array($scope,['menu','pages'],true)){editor_apply_site($input,$next);}elseif(in_array($scope,['image','link'],true)){editor_apply_media($input,$next);}elseif($scope==='global'){
   if(!is_string($id)||!array_key_exists($id,editor_categories()))respond(422,['error'=>'Ungültiger Textstil.']);
   $next['globals'][$id]=check_style($input['style']??[]);
  } elseif($scope==='block'){
   if(!is_string($id)||!isset($editorRegistry[$id]))respond(422,['error'=>'Textblock nicht vorhanden.']);
   if(!empty($input['reset']))unset($next['blocks'][$id]);
   else {
    $style=check_style($input['style']??[]);
    if(array_key_exists('custom',$input)&&!is_bool($input['custom']))respond(422,['error'=>'Ungültige individuelle Anpassung.']);
    $custom=$input['custom']??count($style)>0;
    $block=['style'=>$custom?$style:[],'custom'=>$custom];
    if(array_key_exists('category',$input)){
     if($input['category']!==null){if(!is_string($input['category'])||!array_key_exists($input['category'],editor_categories()))respond(422,['error'=>'Ungültige Textkategorie.']);$block['category']=$input['category'];}
    }elseif(isset($state['blocks'][$id]['category']))$block['category']=$state['blocks'][$id]['category'];
    if(array_key_exists('text',$input)) {if(!is_string($input['text'])||strlen($input['text'])>12000)respond(422,['error'=>'Text zu lang.']);$block['text']=$input['text'];}
    elseif(isset($state['blocks'][$id]['text']))$block['text']=$state['blocks'][$id]['text'];
    $next['blocks'][$id]=$block;
   }
  } else respond(422,['error'=>'Ungültiger Bereich.']);
 }
 $state['previous']=editor_content_snapshot($state);$state['pages']=$next['pages']??$state['pages'];$state['menu']=$next['menu']??$state['menu'];$state['images']=$next['images']??$state['images'];$state['links']=$next['links']??$state['links'];$state['blocks']=$next['blocks'];$state['globals']=$next['globals'];$state['revision']++;editor_write($state);respond(200,['ok'=>true,'revision'=>$state['revision']]);
} catch(Throwable $error){error_log('Site editor: '.$error->getMessage());respond(500,['error'=>'Änderung konnte nicht gespeichert werden.']);}
finally { if(is_resource($lock)){flock($lock,LOCK_UN);fclose($lock);} }

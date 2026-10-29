<?php
declare(strict_types=1);
require __DIR__.'/runtime.php';
$path=editor_request_path();$path=rtrim($path,'/').'/';$currentPage=editor_page($path);
if(!$currentPage||!empty($currentPage['deleted'])||!empty($currentPage['builtin']))editor_not_found();
require __DIR__.'/page-shell.php';

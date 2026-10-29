<?php
declare(strict_types=1);
require __DIR__.'/runtime.php';
$path=parse_url($_SERVER['REQUEST_URI']??'/',PHP_URL_PATH);$path=rtrim($path,'/').'/';$currentPage=editor_page($path);
if(!$currentPage||!empty($currentPage['deleted'])||!empty($currentPage['builtin']))editor_not_found();
require __DIR__.'/page-shell.php';

<?php
declare(strict_types=1);
function editor_theme_supported(): bool {return (editor_config()['themeIntegrationVersion']??0)===1;}
function editor_themes(): array {return json_decode(file_get_contents(__DIR__.'/themes.json'),true,512,JSON_THROW_ON_ERROR);}
function editor_theme_styles(): string {
 global $editorState;$id=$editorState['theme']??null;$theme=editor_themes()[$id??'']??null;if(!$theme)return '';
 $map=['bg'=>'bg','surface'=>'surface','tint'=>'tint','text'=>'text','muted'=>'muted','accent'=>'accent','onAccent'=>'on-accent','link'=>'link','border'=>'border','footer'=>'footer-bg','footerText'=>'footer-text','footerMuted'=>'footer-muted','focus'=>'focus','active'=>'nav-active-bg'];
 $css=':root{color-scheme:'.$theme['mode'].';';foreach($map as $key=>$token)$css.='--site-'.$token.':'.$theme['colors'][$key].';';
 $css.='--site-font-body:'.$theme['bodyFont'].';--site-font-heading:'.$theme['headingFont'].';--accent:var(--site-accent);--muted:var(--site-muted);color:var(--site-text);background:var(--site-bg);font-family:var(--site-font-body);}';
 $css.='body{color:var(--site-text);background:var(--site-bg);font-family:var(--site-font-body)}body :is(h1,h2,h3,h4,h5,h6){font-family:var(--site-font-heading)}';
 return '<style id="editor-theme-styles" data-theme="'.$id.'">'.$css.'</style>';
}
function editor_apply_theme(array $input,array &$next): void {
 if(!editor_theme_supported())respond(422,['error'=>'Diese Website benötigt zuerst die Anbindung an Farbkonzepte.']);
 $id=$input['theme']??null;if(!is_string($id)||!array_key_exists($id,editor_themes()))respond(422,['error'=>'Bitte ein verfügbares Farbkonzept auswählen.']);
 $next['theme']=$id;
 // Applying a complete concept replaces old color/font overrides, retaining content, sizes and roles.
 foreach($next['globals'] as &$style){unset($style['color'],$style['font']);}unset($style);
 foreach($next['blocks'] as &$block){unset($block['style']['color'],$block['style']['font']);if(empty($block['style']))$block['custom']=false;}unset($block);
}

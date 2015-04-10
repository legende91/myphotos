<?php
/*
	!!! MODIFICATION OU REPRODUCTION INTERDITE !!!
	L.111-1 et L.123-1 du code de la propriété intellectuelle
	En cas de demande particulière, veuillez me contacter
	Alexandre Mély - alexandre.mely@gmail.com
*/
session_start();

ini_set('display_errors', 1);

// Settings
include_once ('defines.php');
include_once ('config.php');
include_once ('utils.php');

if (!isset($_REQUEST['action']))
	respond ('missing action parameter', true);
$dir = isset ($_REQUEST['dir'])?$_REQUEST['dir']:'';

switch($_REQUEST['action']) {
	case 'test':
		respond ('ok');
		break;

	case 'list':
		$absolute = $config['photopath'].$dir;
		$json = @file_get_contents($absolute.MYPHOTOS_DIR.SETTINGS_FILE);
		$settings = json_decode($json);
		$visibility = @$settings->visibility?$settings->visibility:$config['defaultvisibility'];

		if (!($dir == './' || hasaccess ($visibility)))
			respond ("You don't have access to this $visibility album", true);

		$name = @$settings->name?$settings->name:basename($dir);
		$folder = array (
			'name'			=> $name,
			'filepath'		=> $dir,
			'visibility'	=> $visibility,
			'parentpath'	=> dirname($dir).'/',
			'groups'		=> isadmin ()?@$settings->groups:[]
		);
		$folders = array ();
		$files = array ();

        if ($handle = @opendir($absolute)) {
            while (false !== ($file = readdir($handle))) { 
                if ($file[0] != ".") { // skip '.', '..' & hidden files
                	$filepath = $dir.$file;
                    if (is_dir($absolute.$file)) { 
                        $json = @file_get_contents($config['photopath'].$filepath.'/'.MYPHOTOS_DIR.SETTINGS_FILE); // in case no .myphotos yet
						$settings = @json_decode($json);
						$visibility = @$settings->visibility?$settings->visibility:$config['defaultvisibility'];
						if (hasaccess ($visibility))
							$folders[] = array (
								'filepath'		=> $filepath.'/',
								'coverurl'		=> 'img.php?f='.$filepath.'/'.MYPHOTOS_DIR.THUMB_DIR.@$settings->cover,
								'visibility'	=> $visibility,
								'filename'		=> @$settings->name?$settings->name:$file,
								'updated'		=> filemtime($absolute.$file)
							);
                    } else {
                        $ext = strtolower(substr(strrchr($file, "."), 1)); // mime_content_type has perf issues
                        $files[] = array (
							'filepath'		=> $filepath,
							'fileurl'		=> 'img.php?f='.$filepath,
							'previewurl'	=> 'img.php?f='.$dir.MYPHOTOS_DIR.PREVIEW_DIR.$file,
							'previewsize'	=> @filesize ($absolute.MYPHOTOS_DIR.PREVIEW_DIR.$file),
							'thumburl'		=> 'img.php?f='.$dir.MYPHOTOS_DIR.THUMB_DIR.$file,
							'filename'		=> $file,
							'size'			=> @filesize ($absolute.$file),
							//'type'		=> $type,
							'updated'	=> filemtime ($absolute.$file)
						);
                    }
                }
            }
            closedir($handle);
        } else {
        	respond ("Impossible to access photo library ($absolute) Verify your config.php", true);
        }

		respond (json_encode(array (
			'folder'	=> $folder,
			'folders'	=> $folders,
			'files'		=> $files
		)));
		break;

	case 'updateFolder':
		if (!isadmin ())
			respond ('Operation not authorized', true);
		$jsonpath = $config['photopath'].$dir.MYPHOTOS_DIR.SETTINGS_FILE;
		$json = file_get_contents($jsonpath);
		$settings = json_decode($json);
		if (isset ($_REQUEST['cover']))
			$settings->cover = $_REQUEST['cover'];
		if (isset ($_REQUEST['visibility']))
			$settings->visibility = $_REQUEST['visibility'];
		if (isset ($_REQUEST['groups']))
			$settings->groups = $_REQUEST['groups'];
		$json = fopen($jsonpath, 'w');
		if ($json
			&& fwrite($json, json_encode($settings))
			&& fclose($json))
			respond ();
		else
			respond ('Error while trying to write the folder settings file', true);
		break;

	case 'getGroups':
		if (!isadmin ())
			respond ('Operation not authorized', true);
		$json = @json_decode(file_get_contents($config['photopath'].MYPHOTOS_DIR.'.groups'));
		respond (json_encode(array (
			'groups' => @$json->groups?$json->groups:[],
			'users'  => @$json->users?$json->users:[]
		)));
		break;

	case 'saveGroups':
		if (!isadmin ())
			respond ('Operation not authorized', true);
		$jsonpath = $config['photopath'].MYPHOTOS_DIR.'.groups';
		$json = fopen($jsonpath, 'w+');
		if ($json
			&& fwrite($json, json_encode(array (
				'groups' => isset ($_REQUEST['groups'])?$_REQUEST['groups']:[],
				'users' => isset ($_REQUEST['users'])?$_REQUEST['users']:[])))
			&& fclose($json))
			respond ();
		else
			respond ('Error while trying to write the groups file', true);
		break;

	default: respond ("unknown action ".$_REQUEST['action'], true);
}

function hasaccess ($visibility) {
	if ($visibility == 'public')
		return true;
	if ($visibility == 'restricted') {
		// todo
	}
	return isadmin ();
}

// Specific for myPhotos
function isadmin () {
	global $admins, $admin_mode;
	return $admin_mode || isset ($_SESSION['me']) && in_array($_SESSION['me']['email'], $admins);
}
?>
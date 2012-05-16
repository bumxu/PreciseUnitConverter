<?php

if(isset($_POST['map']) && $_POST['map'] != ""){
	if(@rename("../j/unit/unit.json", "../j/unit/unit".time().".json")){
		if(@file_put_contents ("../j/unit/unit.json", $_POST['map']))
			die("ok");	
		else
			die("Failed to create the new file");
	}else
		die("Failed to perform backup");	
}else
	die("Failed to read POST -> map");
?>

function check_pass() {
    if (document.getElementById('password').value ==
            document.getElementById('confirm_password').value && document.getElementById('password').value!=="") {
             
        document.getElementById('submit').disabled = false;
    } else {
        console.log("ui");
        document.getElementById('submit').disabled = true;
        
    }
    
}
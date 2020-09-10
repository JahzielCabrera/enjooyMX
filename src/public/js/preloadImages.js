var loadImage = function(event){
    var reader = new FileReader();
    reader.onload =function(){
        var output = document.getElementById('output');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
};

const name = document.getElementById('name').value;
const btn = document.getElementById('button-send');

var sendImg = function(){
    if(name.length==0){
        console.log('Fields are empy');
        location.reload();
    }
    btn.form.submit();
    btn.disabled = true;
    btn.innerText = '';
    btn.innerText = 'Enviando...';
}

var previewImage = function(event){
    document.getElementById('img-old').style.display = 'none';
    var reader = new FileReader();
    reader.onload = function(){
        var output = document.getElementById('output');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);  
};



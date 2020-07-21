const upvote= (btn,val)=>{
    const url = "/upvote";
    const tag = document.getElementById('upvote');
    


   
    const sp = new URLSearchParams();
    sp.append("postId",val);
    fetch(url,{
        body:sp,
        method:"POST",
        
    }).then(data=>{
        console.log(data.json());
        document.getElementById('upvote').innerHTML= +document.getElementById('upvote').innerHTML+1;
    })
    .catch(error=>{console.log(error)})
}

const downvote= (btn,val)=>{
    const url = "/downvote";
    const tag = document.getElementById('downvote');
    


   
    const sp = new URLSearchParams();
    sp.append("postId",val);
    fetch(url,{
        body:sp,
        method:"POST",
        
    }).then(data=>{
        console.log(data.json());
        document.getElementById('downvote').innerHTML= +document.getElementById('downvote').innerHTML+1;
    })
    .catch(error=>{console.log(error)})
}
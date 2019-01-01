

//// if value of button is follow, when clicked an ajax POST request will be sent
// to insert a new row between current user and topic and if successful
// a response will be sent back and text of button should be changed to unfollow
//// if value of button is unfollow, when clicked an ajax DELETE request will be sent
// to remove a row with current user and topic and if successful a response
// will be sent back and text of button should be changed to follow

const topicfollowingcount = document.getElementById('topicfollowingcount');
const button = document.getElementById('followunfollow');
button.addEventListener('click', function(event){
    if (button.innerText === 'FOLLOW') {
        followTopic();
    } else {
        unfollowTopic();
    }
})

function followTopic(){
    // const url = document.getElementById('currentid').getAttribute('href');
    // const userid = url.substring(url.lastIndexOf('/') + 1);
    const topicid = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
    fetch('http://localhost/topicfollowings', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({topicid: topicid})
    }).then(response => response.json())
        .then(result => {
            button.innerText = 'UNFOLLOW';
            topicfollowingcount.innerText = (Number(topicfollowingcount.innerText) + 1) + '';
        });
}

function unfollowTopic(){
    // const url = document.getElementById('currentid').getAttribute('href');
    // const userid = url.substring(url.lastIndexOf('/') + 1);
    const topicid = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
    fetch('http://localhost/topicfollowings', {
        method: 'DELETE',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({topicid: topicid})
    }).then(response => response.json())
        .then(result => {
            button.innerText = 'FOLLOW';
            topicfollowingcount.innerText = (Number(topicfollowingcount.innerText) - 1) + '';

        });
}


// by default, user page displays user information and latest 9 images
// when scrolled to the bottom, send ajax GET request to API server to retrieve next set of
// 9 images and if successful append them into the page
// stop sending ajax requests when there are no more images

const loadMoreElement = document.querySelector('#loadMore');
const galleryElement = document.querySelector('#gallery');
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/images' : 'http://api.gif67.com/images';
const url = window.location.href;
const userid = url.substring(url.lastIndexOf('/') + 1);
let skip = 0;
let limit = 12;
let loading = false;
let finished = false;

document.addEventListener('scroll', () => {

    const rect = loadMoreElement.getBoundingClientRect();
    if (rect.top < window.innerHeight && !loading && !finished) {
        console.log('scrolled');
        loadMore();
    }
});

function loadMore() {
    skip += limit;
    listAllImages(false);
}

function listAllImages(reset = true) {
    loading = true;
    // if (reset) {
    //     mewsElement.innerHTML = '';
    //     skip = 0;
    //     finished = false;
    // }
    fetch(`${API_URL}?filter[fields][id]=true&filter[fields][imageurl]=true&filter[where][userid]=${userid}
    &filter[order]=datecreated%20DESC&filter[limit]=${limit}&filter[skip]=${skip}`).then(response => response.json())
        .then(result => {
            console.log(result);
            result.forEach(image => {
                const div = document.createElement('div');
                div.classList.add("gallery-item");
                const link = document.createElement('a');
                link.classList.add(["gallery-item-a", "mr-none"]);
                link.setAttribute("href", image.id);
                const i = document.createElement('img');
                i.classList.add("gallery-item-img");
                i.setAttribute("src", image.imageurl);
                i.setAttribute("alt", "");
                link.appendChild(i);
                div.appendChild(link);
                galleryElement.appendChild(div);

            });
            // loadingElement.style.display = 'none';
            if (!result.has_more) {
                loadMoreElement.style.visibility = 'hidden';
                finished = true;
            } else {
                loadMoreElement.style.visibility = 'visible';
            }
            loading = false;
        });
}

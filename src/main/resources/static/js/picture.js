window.addEventListener('DOMContentLoaded', (event) => {

    const pictureContainer = document.getElementById('picture-container');

    fetch('/puzzle_project/solve-puzzle')
        .then(response => response.text())
        .then(pictureBase64 => {

            const image = new Image();
            image.src = 'data:image/jpeg;base64,' + pictureBase64;


            pictureContainer.appendChild(image);
        })
});
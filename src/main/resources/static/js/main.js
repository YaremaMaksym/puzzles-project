document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var fileInput = document.getElementById('imageInput');
    var numPiecesInColumn = document.getElementById('numPiecesInColumn').value;
    var numPiecesInRow = document.getElementById('numPiecesInRow').value;

    var formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('numPiecesInColumn', numPiecesInColumn);
    formData.append('numPiecesInRow', numPiecesInRow);

    fetch('/api/v1/puzzle/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Error: ' + response.status);
            }
        })
        .then(data => {
            console.log('POST request was successful:', data);
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('downloadAndStartButtons').style.display = 'block';
        })
        .catch(error => {
            console.error('An error occurred during the POST request:', error);
        });
});

function startPuzzle() {
    window.location.href = "puzzle/desk";
}

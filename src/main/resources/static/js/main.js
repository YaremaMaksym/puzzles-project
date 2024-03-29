document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var fileInput = document.getElementById('imageInput');
    var numPiecesInColumn = document.getElementById('numPiecesInColumn').value;
    var numPiecesInRow = document.getElementById('numPiecesInRow').value;

    var formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('numPiecesInColumn', numPiecesInColumn);
    formData.append('numPiecesInRow', numPiecesInRow);

    fetch('/puzzle_project/upload-picture', {
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
            document.getElementById('successImageUploadMessage').style.display = 'block';
            document.getElementById('downloadAndStartButtons').style.display = 'block';
        })
        .catch(error => {
            console.error('An error occurred during the POST request:', error);
        });
});

document.getElementById('archiveForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var archiveInput = document.getElementById('archiveInput');

    var archiveFormData = new FormData();
    archiveFormData.append('archive', archiveInput.files[0]);

    fetch('/puzzle_project/upload-archive', {
        method: 'POST',
        body: archiveFormData
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Error: ' + response.status);
            }
        })
        .then(data => {
            console.log('Archive upload was successful:', data);
            document.getElementById('successArchiveUploadMessage').style.display = 'block';
            document.getElementById('solvedPuzzleButton').style.display = 'block';
        })
        .catch(error => {
            console.error('An error occurred during the archive upload:', error);
        });
});

function startPuzzle() {
    window.location.href = "puzzle_project/desk";
}

function picturePage() {
    window.location.href = "puzzle_project/picture";
}

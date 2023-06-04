window.addEventListener('DOMContentLoaded', (event) => {

    const puzzleContainer = document.getElementById('puzzle-container');
    const puzzleDesk = document.getElementById('puzzle-desk');

    fetch('/api/v1/puzzle/getPuzzleInfo')
        .then(response => response.json())
        .then(puzzleInfo => {

            const image = new Image();
            image.src = 'data:image/jpeg;base64,' + puzzleInfo.imageBase64Data;

            image.addEventListener('load', () => {

                const puzzleContainerWidth = image.naturalWidth;
                const puzzleContainerHeight = image.naturalHeight;

                puzzleContainer.style.width = puzzleContainerWidth + 'px' ;
                puzzleContainer.style.height = puzzleContainerHeight + 'px';

                puzzleDesk.style.width = puzzleContainerWidth * 3 + 'px';
                puzzleDesk.style.height = puzzleContainerHeight + 'px';


                puzzleInfo.puzzlePieces.forEach(puzzlePiece => {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'puzzle-piece';

                    const pieceImage = new Image();
                    pieceImage.src = 'data:image/jpeg;base64,' + puzzlePiece.imageBase64Data;

                    pieceImage.addEventListener('load', () => {
                        pieceElement.style.width = pieceImage.naturalWidth + 'px';
                        pieceElement.style.height = pieceImage.naturalHeight + 'px';
                    });

                    pieceElement.appendChild(pieceImage);
                    puzzleContainer.appendChild(pieceElement);

                    const puzzlePieceDraggie = new Draggabilly(pieceElement);
                });
            });
        })
});
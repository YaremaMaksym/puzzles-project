let activePuzzlePiece = null;

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

                    addDragHandlers(pieceElement);
                });
            });
        })
});

function addDragHandlers(element) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let rotationAngle = 0; // Додаємо змінну для відстеження поточного кута обертання

    element.addEventListener('mousedown', (event) => {
        event.preventDefault();
        isDragging = true;

        const puzzlePiece = event.target.closest('.puzzle-piece');
        activePuzzlePiece = puzzlePiece;

        const rect = puzzlePiece.getBoundingClientRect();

        if (rotationAngle === 90 || rotationAngle === 270) {
            offsetX = event.clientX - rect.left + (rect.height - rect.width) / 2;
            offsetY = event.clientY - rect.top + (rect.width - rect.height) / 2;
        } else {
            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;
        }

        puzzlePiece.classList.add('active');
    });

    element.addEventListener('mouseup', (event) => {
        event.preventDefault();
        isDragging = false;

        const puzzlePiece = event.target.closest('.puzzle-piece');

        if (puzzlePiece === activePuzzlePiece) {
            puzzlePiece.classList.remove('active');
            activePuzzlePiece = null;
        }
    });

    window.addEventListener('mousemove', (event) => {
        event.preventDefault();

        if (isDragging && activePuzzlePiece) {
            const puzzleContainer = document.getElementById('puzzle-container');

            const containerRect = puzzleContainer.getBoundingClientRect();
            const puzzlePieceRect = activePuzzlePiece.getBoundingClientRect();

            const puzzleDesk = document.getElementById('puzzle-desk');
            const deskRect = puzzleContainer.getBoundingClientRect();


            const newX = event.clientX - containerRect.left - offsetX;
            const newY = event.clientY - containerRect.top - offsetY;

            const minX = -containerRect.left;
            const minY = 0;
            const maxX = puzzleDesk.offsetWidth - puzzlePieceRect.width;
            const maxY = puzzleDesk.offsetHeight - puzzlePieceRect.height;

            const clampedX = Math.min(Math.max(newX, minX), maxX);
            const clampedY = Math.min(Math.max(newY, minY), maxY);

            activePuzzlePiece.style.transform = `translate(${clampedX}px, ${clampedY}px) rotate(${rotationAngle}deg)`; // Включаємо обертання у трансформацію
        }
    });

    window.addEventListener('keydown', (event) => {
        // Обертаємо активну частину пазлу, коли натиснута клавіша 'R'
        if (event.key === 'r' || event.key === 'R') {
            if (activePuzzlePiece && isDragging) {
                rotationAngle += 90; // Обертання на 90 градусів
                if (rotationAngle >= 360) {
                    rotationAngle = 0;
                }
                activePuzzlePiece.style.transform += ` rotate(${rotationAngle}deg)`;
            }
        }
    });
}

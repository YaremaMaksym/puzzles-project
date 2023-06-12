let activePuzzlePiece = null;

window.addEventListener('DOMContentLoaded', (event) => {

    const puzzleContainer = document.getElementById('puzzle-container');
    const puzzleDesk = document.getElementById('puzzle-desk');

    fetch('/api/v1/puzzle/puzzle-info')
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

                addGrid(puzzleInfo);

                puzzleInfo.puzzlePieces.forEach(puzzlePiece => {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'puzzle-piece';

                    const pieceImage = new Image();
                    pieceImage.src = 'data:image/jpeg;base64,' + puzzlePiece.imageBase64Data;

                    pieceImage.addEventListener('load', () => {
                        pieceElement.style.width = pieceImage.naturalWidth + 'px';
                        pieceElement.style.height = pieceImage.naturalHeight + 'px';
                        pieceElement.id = puzzlePiece.name;
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
    let rotationAngle = 0;

    element.addEventListener('mousedown', (event) => {
        event.preventDefault();
        isDragging = true;

        const puzzlePiece = event.target.closest('.puzzle-piece');
        activePuzzlePiece = puzzlePiece;

        // Видаляємо атрибут 'data-cell-id', коли починаємо пересувати пазл
        activePuzzlePiece.removeAttribute('data-cell-id');

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
            attachToGrid(puzzlePiece, rotationAngle); // Прикріплюємо пазл до сітки
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
        if (event.key === 'r' || event.key === 'R') {
            if (activePuzzlePiece && isDragging) {
                rotationAngle += 90;
                if (rotationAngle >= 360) {
                    rotationAngle = 0;
                }
                activePuzzlePiece.style.transform += ` rotate(${rotationAngle}deg)`;
            }
        }
    });
}

function addGrid(puzzleInfo) {
    const numInRow = puzzleInfo.numPiecesInRow;
    const numInColumn = puzzleInfo.numPiecesInColumn;

    const puzzleContainer = document.getElementById('puzzle-container');

    puzzleContainer.style.display = 'grid';
    puzzleContainer.style.gridTemplateRows = `repeat(${numInColumn}, 1fr)`;
    puzzleContainer.style.gridTemplateColumns = `repeat(${numInRow}, 1fr)`;

    for (let y = 0; y < numInColumn; y++) {
        for (let x = 0; x < numInRow; x++) {
            const gridCell = document.createElement('div');
            gridCell.id = `grid-cell-${x}-${y}`;
            gridCell.className = 'grid-cell';
            puzzleContainer.appendChild(gridCell);
        }
    }
}

function attachToGrid(element, rotationAngle) {
    const puzzleContainer = document.getElementById('puzzle-container');
    const gridCells = puzzleContainer.getElementsByClassName('grid-cell');

    let minDistance = Infinity;
    let closestCell = null;

    const pieceRect = element.getBoundingClientRect();
    const pieceCenterX = pieceRect.left + pieceRect.width / 2;
    const pieceCenterY = pieceRect.top + pieceRect.height / 2;

    for (const cell of gridCells) {
        const cellRect = cell.getBoundingClientRect();
        const cellCenterX = cellRect.left + cellRect.width / 2;
        const cellCenterY = cellRect.top + cellRect.height / 2;

        const dx = cellCenterX - pieceCenterX;
        const dy = cellCenterY - pieceCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
            minDistance = distance;
            closestCell = cell;
        }
    }

    if (closestCell && minDistance < 300) {

        // Check if puzzle-cell already occupied
        const existingPiece = Array.from(puzzleContainer.getElementsByClassName('puzzle-piece')).find(piece => piece.dataset.cellId === closestCell.id);
        if (existingPiece) {
            return;
        }

        const containerRect = puzzleContainer.getBoundingClientRect();
        const cellRect = closestCell.getBoundingClientRect();

        const newX = cellRect.left - containerRect.left;
        const newY = cellRect.top - containerRect.top;

        element.style.transform = `translate(${newX}px, ${newY}px) rotate(${rotationAngle}deg)`;
        element.dataset.cellId = closestCell.id;
    }
}
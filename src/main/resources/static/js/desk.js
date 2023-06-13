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

                // Get viewport size
                const viewportWidth = window.innerWidth;  // 100% of viewport width
                const viewportHeight = window.innerHeight * 0.9;  // 90% of viewport height

                // Assign puzzle-desk size based on viewport
                puzzleDesk.style.width = viewportWidth + 'px';
                puzzleDesk.style.height = viewportHeight + 'px';

                // Calculate puzzle-container size to fit into viewport
                const ratio = Math.min(viewportWidth / image.naturalWidth, viewportHeight / image.naturalHeight) * 0.80;

                const puzzleContainerWidth = image.naturalWidth * ratio;
                const puzzleContainerHeight = image.naturalHeight * ratio;

                // Center puzzle-container within puzzle-desk
                puzzleContainer.style.width = puzzleContainerWidth + 'px' ;
                puzzleContainer.style.height = puzzleContainerHeight + 'px';
                puzzleContainer.style.top = '50%';
                puzzleContainer.style.left = '50%';
                puzzleContainer.style.transform = 'translate(-50%, -50%)';

                addGrid(puzzleInfo);

                puzzleInfo.puzzlePieces.forEach(puzzlePiece => {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'puzzle-piece';

                    const pieceImage = new Image();
                    pieceImage.src = 'data:image/jpeg;base64,' + puzzlePiece.imageBase64Data;

                    pieceImage.addEventListener('load', () => {
                        // Resize puzzle pieces to fit the new puzzle-container size
                        pieceElement.style.width = pieceImage.naturalWidth * ratio + 'px';
                        pieceElement.style.height = pieceImage.naturalHeight * ratio + 'px';
                        pieceElement.id = puzzlePiece.name;

                        // Also resize the image inside the puzzle piece
                        pieceImage.style.width = '100%';
                        pieceImage.style.height = '100%';
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
            const minY = -containerRect.top * 0.5;
            const maxX = puzzleDesk.offsetWidth - puzzlePieceRect.width * 2;
            const maxY = puzzleDesk.offsetHeight - puzzlePieceRect.height * 1.5;

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

    if (closestCell && minDistance < 100) {

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

function checkCorrectness() {
    const puzzleContainer = document.getElementById('puzzle-container');
    const puzzlePieces = puzzleContainer.getElementsByClassName('puzzle-piece');
    const placementChecking = document.getElementById('result-of-checking');

    if (Array.from(puzzlePieces).some(piece => !piece.dataset.cellId)) {
        placementChecking.textContent = 'Not all puzzle pieces are attached to the grid!';
        placementChecking.style.display = 'block';
        return;
    }

    const puzzleData = [];

    for (const piece of puzzlePieces) {
        const name = piece.id;
        const xPositionInMatrix = parseInt(piece.dataset.cellId.split('-')[2]);
        const yPositionInMatrix = parseInt(piece.dataset.cellId.split('-')[3]);
        const rotationAngle = parseInt(piece.style.transform.split('rotate(')[1]) || 0;

        if (rotationAngle !== 0) {
            placementChecking.textContent = 'Wrong placement!';
            placementChecking.style.display = 'block';
            return;
        }

        const puzzlePiece = {
            name,
            xPositionInMatrix,
            yPositionInMatrix
        };

        puzzleData.push(puzzlePiece);
    }

    fetch('/api/v1/puzzle/check-puzzle-placement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(puzzleData)
    })
        .then(response => response.json())
        .then(result => {
            handleCheckResult(result);
        })
        .catch(error => {
            console.error('An error occurred during the POST request:', error);
        });
}

function handleCheckResult(result) {
    const placementChecking = document.getElementById('result-of-checking');

    if (result) {
        placementChecking.textContent = 'Congratulations, you have placed the puzzles correctly!';
    } else {
        placementChecking.textContent = 'Wrong placement!';
    }

    placementChecking.style.display = 'block';
}

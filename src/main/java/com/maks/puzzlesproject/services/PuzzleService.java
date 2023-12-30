package com.maks.puzzlesproject.services;

import com.maks.puzzlesproject.models.PuzzlePiece;
import com.maks.puzzlesproject.models.RequestPuzzlePiece;
import com.maks.puzzlesproject.repository.PuzzlePieceRepository;
import com.maks.puzzlesproject.utils.ImageUtils;
import com.maks.puzzlesproject.utils.ZipUtils;
import ij.ImagePlus;
import ij.process.ImageProcessor;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
@AllArgsConstructor
public class PuzzleService {

    private final PuzzlePieceRepository puzzlePieceRepository;

    public List<PuzzlePiece> splitImageIntoPieces(byte[] imageData,
                                                  Integer numPiecesInColumn,
                                                  Integer numPiecesInRow) throws IOException {
        List<PuzzlePiece> puzzlePieces = new ArrayList<>();

        ImagePlus image = ImageUtils.byteArrayToImagePlus(imageData);

        ImageProcessor imp = image.getProcessor();

        int imageWidth = image.getWidth();
        int imageHeight = image.getHeight();

        for (int i = 0; i < numPiecesInRow; i++) {
            for (int j = 0; j < numPiecesInColumn; j++) {

                int puzzleWidth = imageWidth / numPiecesInRow;  // Width of the puzzle
                int puzzleHeight = imageHeight / numPiecesInColumn;  // Height of the puzzle
                int x = i * puzzleWidth;  // Top-left x-coordinate of the puzzle
                int y = j * puzzleHeight;  // Top-left y-coordinate of the puzzle

                imp.setRoi(x, y, puzzleWidth, puzzleHeight);

                ImageProcessor impCrop = imp.crop();
                ImagePlus puzzleImage = new ImagePlus("puzzle", impCrop);

                byte[] puzzlePieceByteImage = ImageUtils.imagePlusToByteArray(puzzleImage);

                String randomFileName = UUID.randomUUID().toString();

                PuzzlePiece puzzlePiece = new PuzzlePiece(randomFileName, i, j, Base64.getEncoder().encodeToString(puzzlePieceByteImage));

                puzzlePieceRepository.save(puzzlePiece);

                puzzlePieces.add(puzzlePiece);
            }
        }

        return puzzlePieces;
    }

    public boolean checkPuzzlePlacement(List<RequestPuzzlePiece> puzzlePiecesFromUser) throws IOException{
        for (RequestPuzzlePiece userPiece : puzzlePiecesFromUser) {

            // Retrieve a puzzle piece from the database by its name
            PuzzlePiece dbPiece = puzzlePieceRepository.findByName(userPiece.name())
                    .orElseThrow(() -> new IllegalStateException("Puzzle piece not found"));

            // Check if the user has placed the puzzle correctly
            if (!Objects.equals(userPiece.xPositionInMatrix(), dbPiece.getXPositionInMatrix())
                    || !Objects.equals(userPiece.yPositionInMatrix(), dbPiece.getYPositionInMatrix())) {

                return false;
            }
        }

        return true;
    }

    public byte[] createPuzzleArchive(List<PuzzlePiece> puzzlePieces) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (ZipOutputStream zipOut = new ZipOutputStream(baos)) {
            for (PuzzlePiece piece : puzzlePieces) {

                ZipEntry entry = new ZipEntry(piece.getName() + ".jpg");
                zipOut.putNextEntry(entry);

                zipOut.write(Base64.getDecoder().decode(piece.getImageBase64Data()));

                zipOut.closeEntry();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return baos.toByteArray();
    }

    public List<PuzzlePiece> extractPuzzlePiecesFromArchive(byte[] archiveData) throws IOException {
        List<PuzzlePiece> puzzlePieces = new ArrayList<>();

        try (ZipInputStream zipIn = new ZipInputStream(new ByteArrayInputStream(archiveData))) {
            ZipEntry entry = zipIn.getNextEntry();

            while (entry != null) {
                String fileName = entry.getName();
                if (fileName.endsWith(".jpg")) {
                    String pieceName = fileName.substring(0, fileName.lastIndexOf(".jpg"));

                    byte[] imageData = ZipUtils.zipEntryToByteArray(zipIn);
                    String imageBase64Data = Base64.getEncoder().encodeToString(imageData);

                    PuzzlePiece puzzlePiece = PuzzlePiece.builder()
                            .name(pieceName)
                            .imageBase64Data(imageBase64Data)
                            .build();

                    puzzlePieces.add(puzzlePiece);
                }

                zipIn.closeEntry();
                entry = zipIn.getNextEntry();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return puzzlePieces;
    }

    public String solvePuzzle(List<PuzzlePiece> puzzlePieces) throws IOException{
        // Gets the position on the matrix for each piece in the list from db
        for (PuzzlePiece piece: puzzlePieces) {
            PuzzlePiece pieceFromDB = puzzlePieceRepository.findByName(piece.getName())
                            .orElseThrow(() -> new IllegalStateException("puzzle piece not found"));

            piece.setXPositionInMatrix(pieceFromDB.getXPositionInMatrix());
            piece.setYPositionInMatrix(pieceFromDB.getYPositionInMatrix());
        }

        // Number of puzzle pieces in a row
        int numPiecesInRow  = puzzlePieces.stream()
                .mapToInt(PuzzlePiece::getXPositionInMatrix)
                .max()
                .getAsInt()
                + 1; //because indexes starts with 0;

        // Number of puzzle pieces in a column
        int numPiecesInColumn = puzzlePieces.stream()
                .mapToInt(PuzzlePiece::getYPositionInMatrix)
                .max()
                .getAsInt()
                + 1;

        // Gets the first piece
        byte[] firstPieceByteArray = Base64.getDecoder().decode(puzzlePieces.get(0).getImageBase64Data());
        ImagePlus firstPiece = ImageUtils.byteArrayToImagePlus(firstPieceByteArray);

        int puzzleWidth = firstPiece.getWidth();
        int puzzleHeight = firstPiece.getHeight();

        int pictureWidth = puzzleWidth * numPiecesInRow;
        int pictureHeight = puzzleHeight * numPiecesInColumn;

        // Resize to the final picture size
        ImageProcessor mergedProcessor = firstPiece.getProcessor().resize(pictureWidth, pictureHeight);

        for (int i = 0; i < numPiecesInRow; i++) {
            for (int j = 0; j < numPiecesInColumn; j++) {

                int xPositionInMatrix = i;
                int yPositionInMatrix = j;

                // Searches for a piece at a certain position in the matrix
                PuzzlePiece piece = puzzlePieces.stream()
                        .filter(puzzlePiece -> puzzlePiece.getXPositionInMatrix() == xPositionInMatrix && puzzlePiece.getYPositionInMatrix() == yPositionInMatrix)
                        .findFirst()
                        .orElse(null);

                byte[] byteArray = Base64.getDecoder().decode(piece.getImageBase64Data());
                ImagePlus pieceImage = ImageUtils.byteArrayToImagePlus(byteArray);
                ImageProcessor pieceProcessor = pieceImage.getProcessor();

                int offsetX = i * puzzleWidth;  // Top-left x-coordinate of the piece
                int offsetY = j * puzzleHeight;  // Top-left y-coordinate of the piece

                // Inserts an image fragment at specific coordinates
                mergedProcessor.copyBits(pieceProcessor, offsetX, offsetY, 0);
            }
        }

        byte[] mergedImageData = ImageUtils.imagePlusToByteArray(new ImagePlus("puzzle", mergedProcessor));

        return Base64.getEncoder().encodeToString(mergedImageData);
    }

}

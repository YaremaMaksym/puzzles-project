package com.maks.puzzlesproject.services;

import com.maks.puzzlesproject.models.PuzzlePiece;
import com.maks.puzzlesproject.utils.GenerateRandomUtil;
import com.maks.puzzlesproject.utils.ImageUtils;
import ij.ImagePlus;
import ij.process.ImageProcessor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class PuzzleService {

    public List<PuzzlePiece> splitImageIntoPieces(byte[] imageData, Integer numPiecesInColumn, Integer numPiecesInRow) throws IOException {
        List<PuzzlePiece> puzzlePieces = new ArrayList<>();

        ImagePlus image = ImageUtils.getImagePlusFormImageData(imageData);

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

                byte[] puzzlePieceByteImage = ImageUtils.getBytesOfImage(puzzleImage);

                String randomFileName = UUID.randomUUID().toString();

                PuzzlePiece puzzlePiece = new PuzzlePiece(randomFileName, Base64.getEncoder().encodeToString(puzzlePieceByteImage));

                puzzlePieces.add(puzzlePiece);
            }
        }

        return puzzlePieces;
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
}

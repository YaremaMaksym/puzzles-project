package com.maks.puzzlesproject.controllers;

import com.maks.puzzlesproject.models.PuzzleInfo;
import com.maks.puzzlesproject.models.PuzzlePiece;
import com.maks.puzzlesproject.services.PuzzleService;
import jakarta.servlet.http.HttpSession;
import lombok.AllArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@Controller
@RequestMapping("/api/v1/puzzle")
@AllArgsConstructor
public class PuzzleController {

    private final PuzzleService puzzleService;

    @GetMapping
    public String getMainPage() {
        return "main";
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("image") MultipartFile file, HttpSession session, Integer numPiecesInColumn, Integer numPiecesInRow) {
        try {
            byte[] imageData = file.getBytes();

            List<PuzzlePiece> puzzlePieces = puzzleService.splitImageIntoPieces(imageData, numPiecesInColumn, numPiecesInRow);

            PuzzleInfo puzzleInfo = new PuzzleInfo(Base64.getEncoder().encodeToString(imageData), puzzlePieces);

            session.setAttribute("puzzleInfo", puzzleInfo);

            return ResponseEntity.ok("Success");

        } catch (IOException e) {
            e.printStackTrace();
            session.setAttribute("puzzlePieces", "An error.html occurred during image upload.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("error");
        }
    }

    @SuppressWarnings("unchecked")
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadPuzzlePieces(HttpSession session){

        PuzzleInfo puzzleInfo = (PuzzleInfo) session.getAttribute("puzzleInfo");

        List<PuzzlePiece> puzzlePieces = puzzleInfo.getPuzzlePieces();

        try {
            byte[] puzzleArchive = puzzleService.createPuzzleArchive(puzzlePieces);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDisposition(ContentDisposition.attachment().filename("puzzle_archive.zip").build());

            return new ResponseEntity<>(puzzleArchive, headers, HttpStatus.OK);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}


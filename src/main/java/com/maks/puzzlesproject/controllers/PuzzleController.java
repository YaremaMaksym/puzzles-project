package com.maks.puzzlesproject.controllers;

import com.maks.puzzlesproject.models.PuzzleInfo;
import com.maks.puzzlesproject.models.PuzzlePiece;
import com.maks.puzzlesproject.models.RequestPuzzlePiece;
import com.maks.puzzlesproject.services.PuzzleService;
import jakarta.servlet.http.HttpSession;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
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
@Slf4j
public class PuzzleController {

    private final PuzzleService puzzleService;

    @GetMapping
    public String getMainPage() {
        return "main";
    }

    @PostMapping("/upload-picture")
    public ResponseEntity<String> uploadImage(@RequestParam("image") MultipartFile file, HttpSession session, Integer numPiecesInColumn, Integer numPiecesInRow) {
        try {
            byte[] imageData = file.getBytes();

            List<PuzzlePiece> puzzlePieces = puzzleService.splitImageIntoPieces(imageData, numPiecesInColumn, numPiecesInRow);

            PuzzleInfo puzzleInfo = new PuzzleInfo(Base64.getEncoder().encodeToString(imageData), numPiecesInRow, numPiecesInColumn, puzzlePieces);

            session.setAttribute("puzzleInfo", puzzleInfo);

            return ResponseEntity.ok("Success");

        } catch (IOException e) {
            e.printStackTrace();
            session.setAttribute("puzzlePieces", "An error.html occurred during image upload.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("error");
        }
    }

    @GetMapping("/download-archive")
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

    @GetMapping("/desk")
    public String getDeskPage(){
        return "desk";
    }

    @GetMapping("/puzzle-info")
    @ResponseBody
    public PuzzleInfo getPuzzlePieces(HttpSession session) {
        return (PuzzleInfo) session.getAttribute("puzzleInfo");
    }

    @PostMapping("/check-puzzle-placement")
    public ResponseEntity<Boolean> checkPuzzlePlacement(@RequestBody List<RequestPuzzlePiece> userPieces) throws IOException {
        log.info("Received piece with id 2 {}", userPieces.get(2).toString());
        boolean isCorrect = puzzleService.checkPuzzlePlacement(userPieces);
        return ResponseEntity.ok(isCorrect);
    }

    @PostMapping("upload-archive")
    public ResponseEntity<String> uploadArchive(@RequestParam("archive") MultipartFile file, HttpSession session) {
        try {
            byte[] archive = file.getBytes();

            List<PuzzlePiece> puzzlePieces = puzzleService.extractPuzzlePiecesFromArchive(archive);

            session.setAttribute("puzzlePiecesFromArchive", puzzlePieces);

            log.info("Extracted image with id 10 {}", puzzlePieces.get(10).toString());

            return ResponseEntity.ok("Success");

        } catch (IOException e) {
            e.printStackTrace();
            session.setAttribute("puzzlePiecesFromArchive", "An error.html occurred during image upload.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("error");
        }
    }

    @GetMapping("/solve-puzzle")
    public ResponseEntity<String> solvePuzzle(HttpSession session) throws IOException {

        List<PuzzlePiece> puzzlePieces = (List<PuzzlePiece>) session.getAttribute("puzzlePiecesFromArchive");

        log.info("received from httpSession image with id 10 {}", puzzlePieces.get(10).toString());

        String solvedPuzzle = puzzleService.solvePuzzle(puzzlePieces);

        return ResponseEntity.ok(solvedPuzzle);
    }

    @GetMapping("/picture")
    public String getPicturePage(){
        return "picture";
    }
}


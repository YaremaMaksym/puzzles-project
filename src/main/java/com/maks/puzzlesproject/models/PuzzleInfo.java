package com.maks.puzzlesproject.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PuzzleInfo {
    private String imageBase64Data;
    private Integer numPiecesInRow;
    private Integer numPiecesInColumn;
    private List<PuzzlePiece> puzzlePieces;
}









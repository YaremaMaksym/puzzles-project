package com.maks.puzzlesproject.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PuzzlePiece {
    private String name;
    private String imageBase64Data;
}

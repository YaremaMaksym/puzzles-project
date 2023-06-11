package com.maks.puzzlesproject.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "piece_position")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PuzzlePiece {
    @Id
    private String name;
    private Integer xPositionInMatrix;
    private Integer yPositionInMatrix;
    @Transient
    private String imageBase64Data;
}

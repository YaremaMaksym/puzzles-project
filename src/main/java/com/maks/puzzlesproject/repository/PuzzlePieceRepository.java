package com.maks.puzzlesproject.repository;

import com.maks.puzzlesproject.models.PuzzlePiece;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PuzzlePieceRepository  extends JpaRepository<PuzzlePiece, String> {
}

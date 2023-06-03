package com.maks.puzzlesproject.utils;

import ij.ImagePlus;
import ij.process.ImageProcessor;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Component
public class ImageUtils {

    public static byte[] getImageData(ImagePlus imagePlus) throws IOException {
        ImageProcessor ip = imagePlus.getProcessor();

        BufferedImage bufferedImage = ip.getBufferedImage();

        //BufferedImage в Base64-кодований рядок
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "jpg", baos);
        baos.flush();
        byte[] imageBytes = baos.toByteArray();
        baos.close();
        return imageBytes;
    }

    public static ImagePlus getImagePlusFormImageData(byte[] imageData) {
        try {
            ByteArrayInputStream inputStream = new ByteArrayInputStream(imageData);
            BufferedImage bufferedImage = ImageIO.read(inputStream);

            ImagePlus imagePlus = new ImagePlus();
            imagePlus.setImage(bufferedImage);

            return imagePlus;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}


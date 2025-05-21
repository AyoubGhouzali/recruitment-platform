package com.ayoub.recruitment.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Configuration
public class FileStorageConfig {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Bean
    public FileStorageService fileStorageService() {
        return new FileStorageService();
    }

    public class FileStorageService {
        
        private final Path rootLocation;

        public FileStorageService() {
            this.rootLocation = Paths.get(uploadDir);
            try {
                Files.createDirectories(rootLocation);
            } catch (IOException e) {
                throw new RuntimeException("Could not initialize storage location", e);
            }
        }

        public String store(MultipartFile file) {
            try {
                if (file.isEmpty()) {
                    throw new RuntimeException("Failed to store empty file");
                }
                
                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                
                String filename = UUID.randomUUID().toString() + extension;
                Path destinationFile = this.rootLocation.resolve(Paths.get(filename))
                        .normalize().toAbsolutePath();
                
                if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
                    throw new RuntimeException("Cannot store file outside current directory");
                }
                
                Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);
                
                return filename;
            } catch (IOException e) {
                throw new RuntimeException("Failed to store file", e);
            }
        }

        public Resource loadAsResource(String filename) {
            try {
                Path file = rootLocation.resolve(filename);
                Resource resource = new UrlResource(file.toUri());
                
                if (resource.exists() || resource.isReadable()) {
                    return resource;
                } else {
                    throw new RuntimeException("Could not read file: " + filename);
                }
            } catch (MalformedURLException e) {
                throw new RuntimeException("Could not read file: " + filename, e);
            }
        }

        public void deleteAll() {
            FileSystemUtils.deleteRecursively(rootLocation.toFile());
        }
    }
}

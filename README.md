# Puzzles Project

This project implements a Java web app for creating, managing and solving puzzles. \
It allows users to upload puzzle images, split them into pieces, manipulate the pieces, and solve the puzzle. \
(the maximum size of the input image should not exceed 5 megabyte. If you wanna more, see [configuration](#configuration))

## Table of Contents

- [Usage](#usage)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)

## Usage
1. Access the application by opening the following URL in your web browser after you runned application : [http://localhost:8080/puzzle_project](http://localhost:8080/puzzle_project).
   ![firefox_3P0JMpLv2q](https://github.com/YaremaMaksym/puzzles-project/assets/31901135/6634e18a-8573-49a3-9cd6-c82dd2b9230d)

2. Upload a puzzle picture by clicking on the "Upload Picture" button and selecting an image file from your local machine. Specify the number of puzzle pieces in each column and row.

3. After uploading the picture, you can start puzzle or download the puzzle pieces as a ZIP archive by clicking on the "Download Archive" button.

4. To start puzzle go to the "Desk" page by clicking on "Start Puzzle" button to see the puzzle pieces after you successfully uploaded image. You can drag, rotate while dragging by pressing on "r" and drop the pieces to their correct positions on the puzzle board.
   ![image](https://github.com/YaremaMaksym/puzzles-project/assets/31901135/e5bc3a93-5942-41ec-80e1-76a58471134e)
   Photo by <a href="https://unsplash.com/@shifanhassan?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Shifan Hassan</a> on <a href="https://unsplash.com/photos/sunflower-field-under-sunny-sky-Xp8uSaYajWU?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>\
   You can drag puzzle pieces out of the grid

6. To check if all puzzle pieces placed correctly, click on the "Check Puzzle Placement" button. The application will verify if the pieces are in the correct positions.

7. You can also solve puzzle by uploading a puzzle archive (ZIP file) containing puzzle pieces by clicking on the "Upload Archive" button. This will extract the puzzle pieces from the archive.

8. Solve the puzzle by clicking on the "Solve Puzzle" button. The application will merge the puzzle pieces and display the solved puzzle.


## Technologies

The project uses the following technologies and frameworks:

- Java
- Spring Framework
- Spring Boot
- Spring MVC
- Spring Data JPA
- Thymeleaf (for server-side templating)
- ImageJ (for image processing and manipulation)
- PostgreSQL (as the relational database management system)
- Lombok (for reducing boilerplate code and enhancing Java classes)
- HTML/CSS/JavaScript (for front-end)
- Maven (for dependency management)
- Git (for version control) 

## Installation

To run the project locally, follow these steps:

1. Clone the repository:

   ```
   git clone https://github.com/YaremaMaksym/puzzles-project.git
   ```

2. Open the project in your preferred IDE.

3. Set up the database:

   * Install and configure PostgreSQL on your system.
   * Create a new database named puzzle_project.
   * Update the `application.properties` file (see [Configuration](#configuration)) with your PostgreSQL credentials.

4. Run the application

The application should now be running on [http://localhost:8080/puzzle_project](http://localhost:8080/puzzle_project).

## Configuration
The project uses the `application.properties` file to configure the database connection. Here is an example of the file contents:

   ```
    server.port=8080

    spring.jpa.properties.hibernate.dialect = org.hibernate.dialect.PostgreSQLDialect
    spring.datasource.driverClassName=org.postgresql.Driver
    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.show-sql=true
    spring.datasource.url=jdbc:postgresql://localhost:5432/puzzle_project
    spring.datasource.username=${PGUSERNAME}
    spring.datasource.password=${PGPASSWORD}

    spring.servlet.multipart.max-file-size=5MB
   ```
To change max file size edit `5MB` in `spring.servlet.multipart.max-file-size=5MB` to new size 

Make sure to replace `${PGUSERNAME}` and `${PGPASSWORD}` with your actual PostgreSQL database credentials.

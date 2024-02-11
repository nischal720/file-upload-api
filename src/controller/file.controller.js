const connection = require("../config/dbConfig");
const upload = async (req, res) => {
  const uploadedFile = req?.files?.file;
  const fileName = uploadedFile?.name;
  const fileData = uploadedFile?.data;

  try {
    if (req.files == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    // Handle file size limit
    const fileSizeLimit = 2 * 1024 * 1024; // 2MB
    if (uploadedFile.size > fileSizeLimit) {
      return res.status(400).send({
        message: "File size cannot be larger than 2MB!",
      });
    }
    // Check if filename already exists in the database
    const checkDuplicateQuery =
      "SELECT COUNT(*) as count FROM files WHERE filename = ?";
    const [result] = await connection
      ?.promise()
      ?.query(checkDuplicateQuery, [fileName]);
    const fileCount = result[0].count;

    if (fileCount > 0) {
      return res.status(400).send({
        message: `File with the name ${fileName} already exists. Please choose a different name.`,
      });
    }

    //insert data
    const insertQuery = "INSERT INTO files (filename, filedata) VALUES (?, ?)";
    const insertValues = [fileName, fileData];
    await connection?.promise()?.query(insertQuery, insertValues);
    res.status(200).send("File uploaded successfully.");
  } catch (err) {
    console.error("Error uploading file:", err);
    if (err.code === "ER_NO_DB_ERROR") {
      return res.status(500).send({
        message:
          "Database not found. Make sure your MySQL server and database are properly configured.",
      });
    }

    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      return res.status(500).send({
        message: "Database connection lost. Reconnecting...",
      });
    }

    res.status(500).send({
      message: `Could not upload the file ${fileName}. ${err}`,
    });
  }
};

const getListFiles = async (req, res) => {
  try {
    const selectQuery = "SELECT filename FROM files";
    const [result] = await connection?.promise()?.query(selectQuery);
    const fileList = result.map((row) => {
      return {
        name: row.filename,
        url: "http://localhost:8080/files-" + row.filename,
      };
    });
    res.status(200).send(fileList);
  } catch (error) {
    throw new Error(error);
  }
};

const download = async (req, res) => {
  const fileName = req.params.name;
  try {
    if (!fileName) {
      res.status(400).json({ message: "filename is not provided" });
    }
    // Fetch file data from the database
    const selectQuery = "SELECT filedata FROM files WHERE filename = ?";
    const [result] = await connection
      ?.promise()
      ?.query(selectQuery, [fileName]);

    if (result.length === 0) {
      // File not found in the database
      return res.status(404).send({
        message: `File ${fileName} not found in the database.`,
      });
    }

    const fileData = result[0].filedata;

    // Set the appropriate headers for the response
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "application/octet-stream");

    // Stream the file data to the response
    res.send(fileData);
  } catch (err) {
    console.error("Error downloading file:", err);
    if (err.code === "ER_NO_DB_ERROR") {
      return res.status(500).send({
        message:
          "Database not found. Make sure your MySQL server and database are properly configured.",
      });
    }

    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      return res.status(500).send({
        message: "Database connection lost. Reconnecting...",
      });
    }

    res.status(500).send({
      message: "Could not download the file. " + err,
    });
  }
};

module.exports = {
  upload,
  getListFiles,
  download,
};

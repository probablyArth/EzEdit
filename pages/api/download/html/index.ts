import { spawn } from "child_process";
import { NextApiHandler } from "next";
import { v4 } from "uuid";
import { createReadStream, unlink } from "fs";

const SCRIPTS_FOLDER_DIR = "./scripts";

const handler: NextApiHandler = async (req, res) => {
  if (req.method === "POST") {
    const uid = v4();
    const PATH = `./temp/${uid}.docx`;
    const { HTML } = req.body;
    const python = spawn(`${SCRIPTS_FOLDER_DIR}/venv/Scripts/python`, [
      `${SCRIPTS_FOLDER_DIR}/html2docxConverter.py`,
      PATH,
    ]);
    python.stdin.write(HTML);
    python.stdin.end();
    python.stderr.on("data", (data) => {
      console.error(data.toString());
    });
    python.on("error", (data) => {
      console.error(data);
      return res.end();
    });
    python.on("close", async (data) => {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=converted.docx"
      );
      createReadStream(PATH).pipe(res);
      unlink(PATH, (err) => {
        throw err;
      });
      return;
    });
  }
};

export default handler;

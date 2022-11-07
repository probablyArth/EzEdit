import { useEffect, useState } from "react";
import mammoth from "mammoth";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Button,
  FileInput,
  Stack,
  Title,
  Text,
  Collapse,
  Paper,
  Mark,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { BiError } from "react-icons/bi";

const initialHTML = "<h1>Hello there!</h1>";

const RichTextEditor = dynamic(() => import("@mantine/rte"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>();
  const [HTML, setHTML] = useState(initialHTML);
  const [collapsed, setCollapsed] = useState(true);

  const toDocx = async () => {
    const res = await axios.post(
      `${router.basePath}/api/download/html/`,
      { HTML: HTML },
      { responseType: "blob" }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "converted.docx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    (async () => {
      if (file) {
        try {
          const buff = await file.arrayBuffer();
          setHTML(
            (
              await mammoth.convertToHtml(
                {
                  arrayBuffer: buff,
                },
                {
                  convertImage: mammoth.images.imgElement(function (image) {
                    return image.read("base64").then(function (imageBuffer) {
                      return {
                        src:
                          "data:" +
                          image.contentType +
                          ";base64," +
                          imageBuffer,
                      };
                    });
                  }),
                }
              )
            ).value
          );
        } catch (e) {
          setFile(null);
          showNotification({
            title: "Error",
            message: "There was something wrong with the file!",
            icon: <BiError />,
            color: "red",
          });
        }
      }
    })();
  }, [file]);

  return (
    <>
      <Stack align={"center"}>
        <Title className="glow" color={"white"} sx={() => ({ fontSize: 76 })}>
          Ez Edit
        </Title>

        <Text sx={() => ({ fontSize: 23 })} italic>
          Edit Word documents <Mark>for free</Mark>
        </Text>
        <Paper>
          <FileInput
            placeholder="None"
            label="Currently Editing"
            onChange={(e) => {
              setFile(e);
            }}
            value={file}
          />
        </Paper>
        <RichTextEditor
          value={HTML}
          onChange={(_, __, ___, editor) => {
            setHTML(editor.getHTML());
          }}
          id="rte"
          controls={[
            ["bold", "italic", "underline"],
            ["h1", "h2", "h3", "h4"],
            ["orderedList", "unorderedList"],
            ["image"],
            ["clean"],
          ]}
          styles={{ root: { width: "100%" } }}
        />
        <Button onClick={toDocx} variant="gradient">
          Download Document
        </Button>
        <div style={{ width: "100%" }}>
          <Button
            onClick={() => {
              setCollapsed((collapsed) => !collapsed);
            }}
          >
            {collapsed ? "Show HTML" : "Hide HTML"}
          </Button>
          <Collapse in={!collapsed}>
            <Paper p={20} style={{ wordWrap: "break-word" }}>
              <Text> {HTML}</Text>
            </Paper>
          </Collapse>
        </div>
      </Stack>
    </>
  );
}

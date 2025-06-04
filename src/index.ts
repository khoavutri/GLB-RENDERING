import { GlbManager } from "./handler/handle-glb";
const button = document.getElementById("button-upload") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const glbManager = new GlbManager();
glbManager.render(canvas)

function updateCanvasSize() {
    const minWidth = document.documentElement.clientWidth;
    canvas.width = Math.min(minWidth - 20, 500);
    canvas.style.width = `${canvas.width}px`;
    canvas.height = Math.min(canvas.width, 450)
    canvas.style.height = `${canvas.height}px`
    canvas.style.margin = `10px`;
}

updateCanvasSize();

button.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".glb, .gif";

    input.addEventListener("change", () => {
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            glbManager.load(file)
            glbManager.render(canvas)
        }
        input.remove();
    });

    input.click();
});


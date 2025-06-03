import { GlbManager } from "./handler/handle-glb";
const button = document.getElementById("button-upload") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const glbManager = new GlbManager();
glbManager.render(canvas)

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


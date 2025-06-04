import { degToRad } from '../util/angle-util';
import { mat4, vec3, mat3 } from "gl-matrix";

export class GlbManager {
    private vertexShaderSource = `
        attribute vec4 aPosition;
        attribute vec3 aNormal;
        attribute vec3 aColor;

        uniform mat4 uModelMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uNormalMatrix;
        uniform mat4 uViewMatrix;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vColor;

        void main() {
          vPosition = vec3(uViewMatrix * uModelMatrix * aPosition);
          vNormal = mat3(uViewMatrix * uNormalMatrix) * aNormal;
          vColor = aColor;
          gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition;
        }
      `;

    private fragmentShaderSource = `
    precision mediump float;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vColor;

    uniform float uCountPositon;
    uniform vec3 uLightPosition[20];
    uniform vec3 uPositionLightColor[20];

    uniform float uCountVector;
    uniform vec3 uLightVectors[20];
    uniform vec3 uLightVectorColors[20];

    uniform vec3 uAmbientColor;
    uniform vec3 uDiffuseColor;
    uniform vec3 uSpecularColor;
    uniform float uShininess;

    void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDirection = normalize(-vPosition);

        vec3 ambient = vec3(0.0);
        vec3 diffuse = vec3(0.0);
        vec3 specular = vec3(0.0);
        vec3 vector = vec3(0.0);

        for (int i = 0; i < 20; i++) {
            if (i >= int(uCountPositon)) break;
            vec3 lightDirection = normalize(uLightPosition[i] - vPosition);

            // Ambient lighting
            ambient += uAmbientColor * uPositionLightColor[i] * vColor;

            // Diffuse lighting (Lambertian)
            float diff = max(dot(lightDirection, normal), 0.0);
            diffuse += diff * uDiffuseColor * uPositionLightColor[i] * vColor;

            // Specular lighting (Phong reflection)
            vec3 reflectDir = reflect(-lightDirection, normal);
            float spec = pow(max(dot(viewDirection, reflectDir), 0.0), uShininess);
            specular += uSpecularColor * spec * uPositionLightColor[i];
        }

        for (int i = 0; i < 20; i++) {
        if (i >= int(uCountVector)) break; 
        vec3 lightDir = normalize(uLightVectors[i]); 

        float diff = max(dot(normal, lightDir), 0.0); 
        vector += diff * uLightVectorColors[i] * vColor;  
        }

        vec3 color = ambient + diffuse + specular + vector;
        gl_FragColor = vec4(color, 1.0);
    }`;

    positions = new Float32Array([
        // Front face (z+)
        -1, -1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 1,
        // Back face (z-)
        -1, -1, -1, -1, 1, -1, 1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1,
        // Top face (y+)
        -1, 1, -1, -1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
        // Bottom face (y-)
        -1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, 1,
        // Right face (x+)
        1, -1, -1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1,
        // Left face (x-)
        -1, -1, -1, -1, -1, 1, -1, 1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1,
    ]);

    normals = new Float32Array([
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

        // Back face (z-)
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

        // Top face (y+)
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

        // Bottom face (y-)
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,

        // Right face (x+)
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

        // Left face (x-)
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    ]);

    colors = new Float32Array([
        // Front face (red)
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Back face (green)
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Top face (blue)
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Bottom face (yellow)
        1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,

        // Right face (magenta)
        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,

        // Left face (cyan)
        0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
    ])

    lightSoucres: Array<{
        isLightPosition: boolean;
        value: Array<number>;
        color: Array<number>;
    }> = [
            {
                isLightPosition: true,
                value: [-1.0, -1.0, -1.0],
                color: [1.0, 1.0, 1.0],
            },
            {
                isLightPosition: true,
                value: [0, 0, 0],
                color: [0.8, 0.7, 0.5],
            },
            {
                isLightPosition: true,
                value: [2.0, 2.0, 2.0],
                color: [1.0, 1.0, 1.0],
            },
            {
                isLightPosition: false,
                value: [0, 0, 1],
                color: [0.8, 0.7, 0.5],
            },
        ]

    constructor() {
    }

    async load(file: File) {
        if (!this.isValidFile(file)) {
            throw new Error("Tệp không hợp lệ: chỉ chấp nhận .glb, .gif");
        }
        try {
            const arrayBuffer = await file.arrayBuffer();
            const view = new DataView(arrayBuffer);

            // Đọc header (12 bytes)
            const magic = view.getUint32(0, true);
            const version = view.getUint32(4, true);
            const length = view.getUint32(8, true);

            if (magic !== 0x46546C67 || version !== 2) { // "glTF" in ASCII
                throw new Error("Không phải file GLB hợp lệ");
            }

            // Đọc chunk 0 (JSON)
            let offset = 12;
            const jsonChunkLength = view.getUint32(offset, true);
            const jsonChunkType = view.getUint32(offset + 4, true);
            if (jsonChunkType !== 0x4E4F534A) { // "JSON" in ASCII
                throw new Error("Chunk JSON không hợp lệ");
            }

            const jsonData = new TextDecoder().decode(new Uint8Array(arrayBuffer, offset + 8, jsonChunkLength));
            const gltf = JSON.parse(jsonData);
            offset += 8 + jsonChunkLength;

            // Đọc chunk 1 (BIN)
            const binChunkLength = view.getUint32(offset, true);
            const binChunkType = view.getUint32(offset + 4, true);
            if (binChunkType !== 0x004E4942) { // "BIN" in ASCII
                throw new Error("Chunk BIN không hợp lệ");
            }
            const binData = new Uint8Array(arrayBuffer, offset + 8, binChunkLength);

            // Validate mesh and primitive
            if (!gltf.meshes || !gltf.meshes[0] || !gltf.meshes[0].primitives || !gltf.meshes[0].primitives[0]) {
                throw new Error("Không tìm thấy mesh hoặc primitive hợp lệ");
            }

            console.log(gltf.meshes);
            gltf.meshes.forEach((mesh: any) => {

            });
        } catch (e) {
            console.error("Lỗi đọc GLB:", e);
            throw e;
        }
    }

    render(canvas: HTMLCanvasElement) {
        const fieldOfValueItem: any = 90;
        const shininessItem: any = 150;
        const translateRate = 5;

        let locateX = 0;
        let locateY = 0;
        let matrix = mat4.create();
        let viewer = mat4.create();
        let scaleSave = 1
        let rendering = false

        const gl = canvas.getContext("webgl2");
        const drawScene = () => {
            if (!rendering) return
            const scale = [scaleSave, scaleSave, scaleSave];
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, this.vertexShaderSource);
            const fragmentShader = this.createShader(
                gl,
                gl.FRAGMENT_SHADER,
                this.fragmentShaderSource
            );
            const program = this.createProgram(gl, vertexShader, fragmentShader);
            gl.useProgram(program);
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

            const normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

            const colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW)

            //Thuộc tính ràng buộc
            const aPosition = gl.getAttribLocation(program, "aPosition");
            gl.enableVertexAttribArray(aPosition);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

            const aNormal = gl.getAttribLocation(program, "aNormal");
            gl.enableVertexAttribArray(aNormal);
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

            const aColor = gl.getAttribLocation(program, "aColor");
            gl.enableVertexAttribArray(aColor);
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

            // Lấy tham số
            const uModelMatrix = gl.getUniformLocation(program, "uModelMatrix");
            const uViewMatrix = gl.getUniformLocation(program, "uViewMatrix");
            const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
            const uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
            const uLightPosition = gl.getUniformLocation(program, "uLightPosition");
            const uPositionLightColor = gl.getUniformLocation(
                program,
                "uPositionLightColor"
            );
            const uCountPositon = gl.getUniformLocation(program, "uCountPositon");
            const uCountVector = gl.getUniformLocation(program, "uCountVector");
            const uLightVectors = gl.getUniformLocation(program, "uLightVectors");
            const uLightVectorColors = gl.getUniformLocation(
                program,
                "uLightVectorColors"
            );
            const uAmbientColor = gl.getUniformLocation(program, "uAmbientColor");
            const uDiffuseColor = gl.getUniformLocation(program, "uDiffuseColor");
            const uSpecularColor = gl.getUniformLocation(program, "uSpecularColor");
            const uShininess = gl.getUniformLocation(program, "uShininess");

            // Lọc lấy nguồn sáng
            let lightPositions = this.lightSoucres
                .filter((item) => item.isLightPosition)
                .map((item) => item.value);
            let positionLightColors = this.lightSoucres
                .filter((item) => item.isLightPosition)
                .map((item) => item.color);

            let lightVectors = this.lightSoucres
                .filter((item) => !item.isLightPosition)
                .map((item) => item.value);
            let vectorLightColors = this.lightSoucres
                .filter((item) => !item.isLightPosition)
                .map((item) => item.color);

            //Truyền tham số vào glsl
            gl.uniform1f(uCountPositon, lightPositions.length);
            gl.uniform3fv(uLightPosition, new Float32Array(lightPositions.flat()));
            gl.uniform3fv(
                uPositionLightColor,
                new Float32Array(positionLightColors.flat())
            );

            gl.uniform1f(uCountVector, lightVectors.length);
            gl.uniform3fv(uLightVectors, new Float32Array(lightVectors.flat()));
            gl.uniform3fv(uLightVectorColors, new Float32Array(vectorLightColors.flat()));

            gl.uniform3fv(uAmbientColor, [0.2, 0.2, 0.2]);
            gl.uniform3fv(uDiffuseColor, [0.5, 0.5, 0.5]);
            gl.uniform3fv(uSpecularColor, [1.0, 1.0, 1.0]);

            gl.uniform1f(uShininess, Number(shininessItem));

            // Thiết lập ma trận mô hình, chế độ xem và phép chiếu
            const modelViewMatrix = mat4.create();
            mat4.scale(modelViewMatrix, matrix, [scale[0], scale[1], scale[2]]);
            gl.uniformMatrix4fv(uModelMatrix, false, modelViewMatrix);

            const projectionMatrix = mat4.create();

            mat4.perspective(
                projectionMatrix,
                (Math.PI * Number(fieldOfValueItem)) / 180,
                canvas.width / canvas.height,
                0.1,
                100
            );

            var camera: any = [0, 0, -5];
            var target: any = [0, 0, 0];
            var up: any = [0, 1, 0];
            const cameraMatrix = mat4.lookAt(mat4.create(), camera, target, up);
            viewer = mat4.create();
            mat4.invert(viewer, cameraMatrix);

            gl.uniformMatrix4fv(uViewMatrix, false, viewer);
            gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);

            const normalMatrix = mat4.create();
            mat4.invert(normalMatrix, modelViewMatrix);
            mat4.transpose(normalMatrix, normalMatrix);

            gl.uniformMatrix4fv(uNormalMatrix, false, normalMatrix);
            gl.enable(gl.DEPTH_TEST);
            gl.clearColor(0.0, 0.0, 0.0, 1.0)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, this.positions.length / 3);
            rendering = false
            requestAnimationFrame(drawScene)
        }
        rendering = true
        requestAnimationFrame(drawScene)

        canvas.addEventListener("mousedown", (event: MouseEvent) => {
            if (event.button === 2) return;
            const rect = canvas.getBoundingClientRect();
            locateX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            locateY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            const onMouseMove = (e: MouseEvent) => {
                const touchMove = e;
                const yAxis: any = [0, 1, 0];
                const xAxis: any = [1, 0, 0];

                vec3.transformMat3(
                    yAxis,
                    yAxis,
                    mat3.fromMat4(mat3.create(), mat4.invert(mat4.create(), viewer))
                );

                vec3.transformMat3(
                    xAxis,
                    xAxis,
                    mat3.fromMat4(mat3.create(), mat4.invert(mat4.create(), viewer))
                );

                const rect = canvas.getBoundingClientRect();
                const locatingX = ((touchMove.clientX - rect.left) / rect.width) * 2 - 1;
                const locatingY = -((touchMove.clientY - rect.top) / rect.height) * 2 + 1;

                mat4.multiply(
                    matrix,
                    mat4.fromRotation(mat4.create(), -(locatingY - locateY) * Math.PI, xAxis),
                    matrix
                );

                mat4.multiply(
                    matrix,
                    mat4.fromRotation(mat4.create(), (locatingX - locateX) * Math.PI, yAxis),
                    matrix
                );

                locateX = locatingX;
                locateY = locatingY;

                rendering = true
                requestAnimationFrame(drawScene)
            };

            const onMouseUp = () => {
                locateX = 0;
                locateY = 0;
                canvas.removeEventListener("mousemove", onMouseMove);
                canvas.removeEventListener("mouseup", onMouseUp);
            };

            canvas.addEventListener("mousemove", onMouseMove);
            canvas.addEventListener("mouseup", onMouseUp);
        });

        canvas.addEventListener("mousedown", (event: MouseEvent) => {
            if (event.button !== 2) return;
            const rect = canvas.getBoundingClientRect();
            locateX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            locateY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            const onMouseMove = (e: MouseEvent) => {
                const touchMove = e;
                const yAxis: any = [0, 1, 0];
                const xAxis: any = [1, 0, 0];

                vec3.transformMat3(
                    yAxis,
                    yAxis,
                    mat3.fromMat4(mat3.create(), mat4.invert(mat4.create(), viewer))
                );

                vec3.transformMat3(
                    xAxis,
                    xAxis,
                    mat3.fromMat4(mat3.create(), mat4.invert(mat4.create(), viewer))
                );

                const rect = canvas.getBoundingClientRect();
                const locatingX = ((touchMove.clientX - rect.left) / rect.width) * 2 - 1;
                const locatingY = -((touchMove.clientY - rect.top) / rect.height) * 2 + 1;

                mat4.multiply(
                    matrix,
                    mat4.translate(mat4.create(), mat4.create(), [-(locatingX - locateX) * translateRate, (locatingY - locateY) * translateRate, 0.0]),
                    matrix
                );

                locateX = locatingX;
                locateY = locatingY;

                rendering = true
                requestAnimationFrame(drawScene)
            };

            const onMouseUp = () => {
                locateX = 0;
                locateY = 0;
                canvas.removeEventListener("mousemove", onMouseMove);
                canvas.removeEventListener("mouseup", onMouseUp);
            };

            canvas.addEventListener("mousemove", onMouseMove);
            canvas.addEventListener("mouseup", onMouseUp);
        });

        canvas.addEventListener("contextmenu", (e) => e.preventDefault());

        canvas.addEventListener("wheel", (e: any) => {
            e.preventDefault();
            const delta = e.deltaY;
            const zoomSpeed = 0.001;
            scaleSave -= delta * zoomSpeed;

            if (scaleSave < zoomSpeed * 10) {
                scaleSave = zoomSpeed * 10;
            }

            if (scaleSave > 2.5) {
                scaleSave = 2.5;
            }

            rendering = true
            requestAnimationFrame(drawScene)
        });

        canvas.addEventListener("touchstart", (event: TouchEvent) => {
            event.preventDefault();
            if (event.touches.length === 1) {
                const touch = event.touches[0];
                const rect = canvas.getBoundingClientRect();

                locateX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
                locateY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

                const onTouchMove = (e: TouchEvent) => {
                    const touchMove = e.touches[0];
                    const yAxis: any = [0, 1, 0];
                    const xAxis: any = [1, 0, 0];

                    vec3.transformMat3(
                        yAxis,
                        yAxis,
                        mat3.fromMat4(mat3.create(), mat4.invert(mat4.create(), viewer))
                    );

                    vec3.transformMat3(
                        xAxis,
                        xAxis,
                        mat3.fromMat4(mat3.create(), mat4.invert(mat4.create(), viewer))
                    );

                    const rect = canvas.getBoundingClientRect();
                    const locatingX = ((touchMove.clientX - rect.left) / rect.width) * 2 - 1;
                    const locatingY = -((touchMove.clientY - rect.top) / rect.height) * 2 + 1;

                    mat4.multiply(
                        matrix,
                        mat4.fromRotation(
                            mat4.create(),
                            -(locatingY - locateY) * Math.PI,
                            xAxis
                        ),
                        matrix
                    );

                    mat4.multiply(
                        matrix,
                        mat4.fromRotation(
                            mat4.create(),
                            (locatingX - locateX) * Math.PI,
                            yAxis
                        ),
                        matrix
                    );

                    locateX = locatingX;
                    locateY = locatingY;

                    rendering = true
                    requestAnimationFrame(drawScene)
                };

                const onTouchEnd = () => {
                    locateX = 0;
                    locateY = 0;
                    canvas.removeEventListener("touchmove", onTouchMove);
                    canvas.removeEventListener("touchend", onTouchEnd);
                };

                canvas.addEventListener("touchmove", onTouchMove);
                canvas.addEventListener("touchend", onTouchEnd);
            }
        });

        let initialDistance = 0;

        canvas.addEventListener("touchstart", (event: TouchEvent) => {
            if (event.touches.length === 2) {
                const dx = event.touches[0].clientX - event.touches[1].clientX;
                const dy = event.touches[0].clientY - event.touches[1].clientY;
                initialDistance = Math.sqrt(dx * dx + dy * dy);
            }
        });

        canvas.addEventListener("touchmove", (event: TouchEvent) => {
            event.preventDefault();

            if (event.touches.length === 2) {
                const dx = event.touches[0].clientX - event.touches[1].clientX;
                const dy = event.touches[0].clientY - event.touches[1].clientY;
                const currentDistance = Math.sqrt(dx * dx + dy * dy);

                const zoomSpeed = 0.005;
                const deltaDistance = currentDistance - initialDistance;
                scaleSave += deltaDistance * zoomSpeed;
                initialDistance = currentDistance;

                // Giới hạn scale
                if (scaleSave < zoomSpeed * 10) {
                    scaleSave = zoomSpeed * 10;
                }

                if (scaleSave > 2.5) {
                    scaleSave = 2.5;
                }

                // Handle translation
                const rect = canvas.getBoundingClientRect();
                const currentMidpointX = ((event.touches[0].clientX + event.touches[1].clientX) / 2 - rect.left) / rect.width * 2 - 1;
                const currentMidpointY = -((event.touches[0].clientY + event.touches[1].clientY) / 2 - rect.top) / rect.height * 2 + 1;

                const yAxis: any = [0, 1, 0];
                const xAxis: any = [1, 0, 0];

                vec3.transformMat3(
                    yAxis,
                    yAxis,
                    mat3.fromMat4(mat3.create(), mat4.invert(mat4.create(), viewer))
                );

                vec3.transformMat3(
                    xAxis,
                    xAxis,
                    mat3.fromMat4(mat3.create(), mat4.invert(mat4.create(), viewer))
                );

                mat4.multiply(
                    matrix,
                    mat4.translate(mat4.create(), mat4.create(), [-(currentMidpointX - locateX) * translateRate, (currentMidpointY - locateY) * translateRate, 0.0]),
                    matrix
                );

                locateX = currentMidpointX;
                locateY = currentMidpointY;

                rendering = true
                requestAnimationFrame(drawScene)
            }
        });

        canvas.addEventListener("touchend", () => {
            locateX = 0;
            locateY = 0;
        });
    }

    isValidFile(file: File): boolean {
        const validExtensions = ['.glb', '.gif'];
        return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    }

    createShader(gl: any, type: any, source: any) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    };

    createProgram(gl: any, vertexShader: any, fragmentShader: any) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
        console.error(gl.getProgramInfoLog(program));
        return null;
    };
}
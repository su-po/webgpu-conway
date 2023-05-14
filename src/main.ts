

const canvas = document.querySelector('canvas') as HTMLCanvasElement

// Check if device has webGPU support
if (!navigator.gpu) {
	throw new Error('WebGPU is not supported!')
}

// If support exists next attempt to grab an adapter.
/* Options can be passed into the adapter. 
 * https://developer.mozilla.org/en-US/docs/Web/API/GPU/requestAdapter
 * Here are a few common ones.
 * powerPreferences -> ["low-power"] || ["high-performance"]
 *
 *
 *
 */
const adapter = await navigator.gpu.requestAdapter()

if (!adapter) {
	throw new Error('Failed to get adapter!')
}

const device = await adapter.requestDevice()

/* 
 * after getting the device it must be configured with the canvas to show
anything. 
*/
const context = canvas.getContext("webgpu")
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context ? context.configure({
	device: device, // Specifies which device to use
	format: canvasFormat, // Specifies which TextureFormat
}) : null


// Textures are the objects that WebGPU uses to store image data, and each texture has a format that lets the GPU know how that data is laid out in memory. 
// The canvas context provides textures for your code to draw into, and the format that you use can have an impact on how efficiently the canvas shows those images. Different types of devices perform best when using different texture formats, and if you don't use the device's preferred format it may cause extra memory copies to happen behind the scenes before the image can be displayed as part of the page.
// Canvas configuration is separate from device creation you can have any number of canvases that are all being rendered by a single device! This will make certain use cases, like multi-pane 3D editors, much easier to develop.
//

// GPU Commands
const encoder = device.createCommandEncoder();


// use encoder to begin a render pass.
// Render passes are when all drawing operations in WebGPU happen. Each one starts off with a beginRenderPass() call, which defines the textures that receive the output of any drawing commands performed.
// More advanced uses can provide several textures, called attachments, with various purposes such as storing the depth of rendered geometry or providing antialiasing. For this app, however, you only need one.
//

const pass1 = encoder.beginRenderPass({
	colorAttachments: [{
		view: context!.getCurrentTexture().createView(),
		clearValue: [0.8, 0.9, 0.9, 1],
		//The clearValue instructs the render pass which color it should use when performing the clear operation at the beginning of the pass.
		loadOp: "clear",
		storeOp: "store"
	}]
})
pass1.end()

// 'finish' the encoder to get a command buffer back! 
const commandBuffer = encoder.finish()

// submit the commandBuffer to the queue to be used. commandBuffers cannot be
// reused.
device.queue.submit([commandBuffer])

 // this is equivalent to the previous device.queue.submit([encoder.finish()]) 

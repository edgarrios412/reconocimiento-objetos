export const drawRect = (detections, ctx) => {
    detections.forEach(prediction => {
        const [x,y,width,height] = prediction.bbox;
        const text = prediction.class

        if(text == "cell phone"){
            alert("Un telefono detectado")
        }

        const color = 'black'
        ctx.strokeSylt = color
        ctx.font = '18px Arial'
        ctx.fillStyle = color

        ctx.beginPath()
        ctx.fillText(text,x,y)
        ctx.rect(x,y,width,height)
        ctx.stroke()
    });
}
import canvasSketch from 'canvas-sketch'
import { degToRad } from 'canvas-sketch-util/math'
import { range, pick, value, setSeed } from 'canvas-sketch-util/random'
import { offsetHSL, style } from 'canvas-sketch-util/color'
import risoColors from 'riso-colors'

const seed = Date.now()

const settings = {
  dimensions: [1080, 1080],
  name: seed
}


const sketch = ({ context, width, height }) => {
  setSeed(seed)
  let x, y, w, h, fill, stroke, blend

  const num = 40
  const degrees = -30

  const rects = []

  const rectColors = [pick(risoColors), pick(risoColors)]

  const bgColor = pick(rectColors).hex

  const mask = {
    radius: width * 0.4,
    sides: 3,
    x: width * 0.5,
    y: height * 0.58
  }

  for (let i = 0; i < num; i++) {
    x = range(0, width)
    y = range(0, height)
    w = range(600, width)
    h = range(40, 200)

    fill = pick(rectColors).hex
    stroke = pick(rectColors).hex

    blend = (value() > 0.5 ) ? 'overlay' : 'source-over'

    rects.push({ x, y, w, h, fill, stroke, blend })
  }

  return ({ context, width, height }) => {
    context.fillStyle = bgColor
    context.fillRect(0, 0, width, height)

    context.save()
    context.translate(mask.x, mask.y)

    drawPolygon({context, radius: mask.radius, sides: mask.sides})

   
    context.clip(); // tudo que foi desenhado após o clipe aparece dentro do triangulo
    

    

    rects.forEach((rect) => {
      const { x, y, w, h, fill, stroke, blend } = rect
      let shadowColor
      //sempre que transformamos o contexto, é uma boa pratica restaura-lo ao seu estado anterior
      context.save() //salva o estado
      context.translate(-mask.x, -mask.y);
      
      context.translate(x, y)
      context.strokeStyle = stroke
      context.fillStyle = fill
      context.lineWidth = 10

      context.globalCompositeOperation = blend

      drawSkewedRect({ context, w, h, degrees })

      shadowColor = offsetHSL(fill, 0, 0, -20)
      shadowColor.rgba[3] = 0.5

      context.shadowColor = style(shadowColor.rgb)
      context.shadowOffsetX = -10
      context.shadowOffsetY = 20

      context.fill()

      context.shadowColor = null
      context.stroke()

      context.globalCompositeOperation = 'overlay'

      context.lineWidth = 2
      context.strokeStyle = 'black'
      context.stroke()

      context.restore() //restaura, devemos fazer isso sempre
    })
    context.restore()

    //polygon outline
    context.save();
    context.translate(mask.x, mask.y);

    drawPolygon({context, radius: mask.radius - context.lineWidth, sides: mask.sides})

    context.globalCompositeOperation='color-burn';
    
    context.lineWidth = 20
    context.strokeStyle = rectColors[0].hex
    context.stroke()

    context.restore();
    
  }
}

const drawSkewedRect = ({ context, w = 600, h = 200, degrees = -45 }) => {
  const angle = degToRad(degrees)
  const rx = Math.cos(angle) * w
  const ry = Math.sin(angle) * w

  //para desenhar apenas um contorno usamos o stroke
  //para desenhar o retangulo precisamos do strokeRect

  context.save()
  context.translate(rx * -0.5, (ry + h) * -0.5)

  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(rx, ry)
  context.lineTo(rx, ry + h)
  context.lineTo(0, h)
  context.closePath()
  context.stroke()

  context.restore()
}

const drawPolygon = ({context, radius = 100, sides = 3}) => {
  const slice = Math.PI * 2 / sides

  context.beginPath();
  context.moveTo(0, -radius);

  for(let i = 1; i < sides; i++){
    const theta = i * slice - Math.PI * 0.5
    context.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
  }

  context.closePath();
  
  
}

canvasSketch(sketch, settings)

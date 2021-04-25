package jamcy

import org.lwjgl.opengl.GL11
import org.lwjgl.opengl.GL20.*
import kotlin.math.*

object HexGrid {
  private const val precision = 1000
  private const val radius = 100

  fun draw() {
    glBegin(GL_LINES)
    drawVertex(Point(0, 0), 0, HashSet())
    glEnd()
  }

  private fun drawVertex(vert: Point, phase: Int, vertices: MutableSet<Point>, depth: Int = 30) {
    vertices.add(vert)
    val vx: Float = vert.x.toFloat() / precision
    val vy: Float = vert.y.toFloat() / precision
    for (i in 0..2) {
      val angle = ((phase + i * 2) % 6) * PI / 3
      val linkedVert = Point(vert.x + (sin(angle) * radius).roundToInt(), vert.y + (cos(angle) * radius).roundToInt())
      GL11.glVertex2f(vx, vy)
      GL11.glVertex2f(linkedVert.x.toFloat() / precision, linkedVert.y.toFloat() / precision)
      if (depth > 0 && !vertices.contains(linkedVert) && abs(linkedVert.x) < precision && abs(linkedVert.x) < precision) {
        drawVertex(linkedVert, (phase + i * 2) % 6, vertices, depth - 1)
      }
    }
  }
}

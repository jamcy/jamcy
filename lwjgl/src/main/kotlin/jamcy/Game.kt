package jamcy

import org.lwjgl.glfw.GLFWErrorCallback
import org.lwjgl.opengl.GL
import org.lwjgl.opengl.GL20

import org.lwjgl.glfw.Callbacks.glfwFreeCallbacks
import org.lwjgl.glfw.GLFW.*
import org.lwjgl.opengl.GL20.*
import org.lwjgl.system.MemoryStack.stackPush
import org.lwjgl.system.MemoryUtil.NULL

object Game {
  private var window: Long = 0

  fun run() {
    try {
      init()
      loop()
    } finally {
      glfwFreeCallbacks(window)
      glfwDestroyWindow(window)
      glfwTerminate()
      glfwSetErrorCallback(null)!!.free()
    }
  }

  private fun init() {
    // Setup an error callback. The default implementation
    // will print the error message in System.err.
    GLFWErrorCallback.createPrint(System.err).set()

    // Initialize GLFW. Most GLFW functions will not work before doing this.
    if (!glfwInit())
      throw IllegalStateException("Unable to initialize GLFW")

    // Configure GLFW
    glfwDefaultWindowHints() // optional, the current window hints are already the default
    glfwWindowHint(GLFW_VISIBLE, GLFW_FALSE) // the window will stay hidden after creation
    glfwWindowHint(GLFW_RESIZABLE, GLFW_TRUE) // the window will be resizable

    // Create the window
    window = glfwCreateWindow(800, 800, "Game", NULL, NULL)
    if (window == NULL) {
      throw RuntimeException("Failed to create the GLFW window")
    }

    // Setup a key callback. It will be called every time a key is pressed, repeated or released.
    glfwSetKeyCallback(window) { window, key, scancode, action, mods ->
      if (key == GLFW_KEY_ESCAPE && action == GLFW_RELEASE) {
        glfwSetWindowShouldClose(window, true) // We will detect this in the rendering loop
      }
    }

    //    glfwSetMouseButtonCallback(window) { window, button, action, mods ->
    //    }
    //
    //    glfwSetCursorPosCallback(window) {window, xpos, ypos ->
    //    }

    // Get the thread stack and push a new frame
    stackPush().use { stack ->
      val pWidth = stack.mallocInt(1)
      val pHeight = stack.mallocInt(1)

      // Get the window size passed to glfwCreateWindow
      glfwGetWindowSize(window, pWidth, pHeight)

      // Get the resolution of the primary monitor
      val vidmode = glfwGetVideoMode(glfwGetPrimaryMonitor())!!

      // Center the window
      glfwSetWindowPos(window, (vidmode.width() - pWidth.get(0)) / 2, (vidmode.height() - pHeight.get(0)) / 2)
    }

    glfwMakeContextCurrent(window)
    // Enable v-sync
    glfwSwapInterval(1)
    glfwShowWindow(window)
  }

  private fun loop() {
    // This line is critical for LWJGL's interoperation with GLFW's
    // OpenGL context, or any context that is managed externally.
    // LWJGL detects the context that is current in the current thread,
    // creates the GLCapabilities instance and makes the OpenGL
    // bindings available for use.
    GL.createCapabilities()

    val shaderId = loadShader("test.frag", GL_FRAGMENT_SHADER)
    val programId = glCreateProgram()

    glAttachShader(programId, shaderId)

    glLinkProgram(programId)
    glValidateProgram(programId)

    glClearColor(0.0f, 0.0f, 0.0f, 0.0f)

    while (!glfwWindowShouldClose(window)) {
      glfwPollEvents()

      glClear(GL_COLOR_BUFFER_BIT or GL_DEPTH_BUFFER_BIT) // clear the framebuffer

      glUseProgram(programId)

      glBegin(GL_QUADS)
      glVertex2f(-1f, -1f)
      glVertex2f(+1f, -1f)
      glVertex2f(+1f, +1f)
      glVertex2f(-1f, +1f)
      glEnd()

      glUseProgram(0)

      HexGrid.draw()

      glfwSwapBuffers(window)
    }
  }

  private fun loadShader(location: String, type: Int): Int {
    val shaderHandle = glCreateShader(type)
    glShaderSource(shaderHandle, Utils.readShader(location))
    glCompileShader(shaderHandle)

    require(glGetShaderi(shaderHandle, GL_COMPILE_STATUS) != GL_FALSE) { GL20.glGetShaderInfoLog(shaderHandle) }

    return shaderHandle
  }
}

package jamcy

import org.apache.commons.io.IOUtils
import java.nio.charset.StandardCharsets

object Utils {
  fun readShader(name: String): String {
    ClassLoader.getSystemResourceAsStream(name).use {
      return IOUtils.readLines(it, StandardCharsets.UTF_8).joinToString("\n")
    }
  }
}

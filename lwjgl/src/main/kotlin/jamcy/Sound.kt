package jamcy
import org.apache.commons.io.IOUtils
import java.nio.*

import org.lwjgl.openal.*;
import org.lwjgl.openal.AL10.*;
import org.lwjgl.openal.ALC10.*;
import org.lwjgl.stb.STBVorbis.*;
import org.lwjgl.system.MemoryStack.*;
import org.lwjgl.system.MemoryUtil
import org.lwjgl.system.libc.LibCStdlib.*;
import java.io.InputStream
import java.nio.charset.StandardCharsets

object Sound {
  fun test() {
    //Initialization
    val defaultDeviceName = alcGetString(0, ALC_DEFAULT_DEVICE_SPECIFIER)
    val device = alcOpenDevice(defaultDeviceName)
    val attributes = intArrayOf(0)
    val context = alcCreateContext(device, attributes)
    alcMakeContextCurrent(context)

    val alcCapabilities = ALC.createCapabilities(device)
    val alCapabilities = AL.createCapabilities(alcCapabilities)
    var rawAudioBuffer: ShortBuffer? = null
    var channels: Int
    var sampleRate: Int

    stackPush().use { stack ->
      //Allocate space to store return information from the function
      val channelsBuffer = stack.mallocInt(1)
      val sampleRateBuffer = stack.mallocInt(1)

      ClassLoader.getSystemResourceAsStream("charge.ogg").use {
        val fileBuffer = MemoryUtil.memAlloc(it.available()).put(it.readAllBytes()).flip()
        rawAudioBuffer = stb_vorbis_decode_memory(fileBuffer, channelsBuffer, sampleRateBuffer)!!
      }

      //Retreive the extra information that was stored in the buffers by the function
      channels = channelsBuffer.get(0)
      sampleRate = sampleRateBuffer.get(0)
      //Find the correct OpenAL format
      var format = -1
      if (channels == 1) {
        format = AL_FORMAT_MONO16
      } else if (channels == 2) {
        format = AL_FORMAT_STEREO16
      }

      //Request space for the buffer
      val bufferPointer = alGenBuffers()
      //Send the data to OpenAL
      if (rawAudioBuffer != null) {
        alBufferData(bufferPointer, format, rawAudioBuffer, sampleRate)
      }
      //Free the memory allocated by STB
      free(rawAudioBuffer)
      //Request a source
      val sourcePointer = alGenSources()
      //Assign the sound we just loaded to the source
      alSourcei(sourcePointer, AL_BUFFER, bufferPointer)
      //Play the sound
      alSourcePlay(sourcePointer)

      Thread.sleep(1000)

      //Terminate OpenAL
      alDeleteSources(sourcePointer)
      alDeleteBuffers(bufferPointer)
      alcDestroyContext(context)
      alcCloseDevice(device)
    }
  }
}
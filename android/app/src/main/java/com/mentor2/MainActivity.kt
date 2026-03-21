package com.mentor2

import android.app.Activity
import android.os.Bundle
import android.widget.TextView
import android.graphics.Color
import android.view.Gravity

class MainActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    val textView = TextView(this)
    textView.text = "Vconnect - App is running!"
    textView.textSize = 32f
    textView.setTextColor(Color.BLACK)
    textView.setGravity(Gravity.CENTER)
    
    setContentView(textView)
  }
}

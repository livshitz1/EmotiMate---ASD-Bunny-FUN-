using UnityEngine;

public class BunnyInteraction : MonoBehaviour
{
    public ParticleSystem bubbleEffect;

    void Start()
    {
        if (bubbleEffect != null)
            bubbleEffect.Stop();
    }

    void OnMouseDown() // פועל בלחיצה על הארנב
    {
        if (bubbleEffect != null)
        {
            bubbleEffect.Play();
            Invoke("StopBubbles", 2.0f); // מפסיק אחרי 2 שניות
        }
    }

    void StopBubbles()
    {
        bubbleEffect.Stop();
    }
}

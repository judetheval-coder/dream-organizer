export async function POST(request: Request) {
  try {
    const { dream } = await request.json()

    if (!dream) {
      return Response.json({ error: 'dream required' }, { status: 400 })
    }

    // AI-generated roadmap steps
    const steps = [
      `Research and understand the fundamentals of ${dream}`,
      `Find online courses, tutorials, or mentors in ${dream}`,
      `Practice daily for 30 minutes minimum`,
      `Build a small project to apply your knowledge`,
      `Join a community or forum related to ${dream}`,
      `Create a portfolio showcasing your work`,
      `Set milestones and track your progress`,
    ]

    return Response.json({
      roadmap: steps,
      estimatedTime: '3-6 months',
      difficulty: 'Intermediate',
      resources: [
        'YouTube tutorials',
        'Online courses (Udemy, Coursera)',
        'Community forums',
        'Practice platforms',
      ]
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return Response.json({ error: message }, { status: 500 })
  }
}

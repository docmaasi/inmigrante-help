import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BookOpen,
  Heart,
  MessageCircle,
  Users,
  Clock,
  HandHeart,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Quote,
  Smartphone,
  Home,
  Brain,
  Activity,
  Shield,
  Lightbulb,
  CheckCircle
} from 'lucide-react';

const articles = [
  {
    id: 'building-bridges',
    title: 'Building Bridges: How to Respectfully Interact with Adults Who Have Developmental Disabilities',
    description: 'Learn how to interact respectfully and empathetically with adults who have developmental disabilities.',
    icon: Heart,
    color: 'teal',
    readTime: '8 min read',
  },
  {
    id: 'seniors-helping-seniors',
    title: 'How Seniors Are Actively Helping Fellow Seniors Combat Loneliness Through Compassionate Companions',
    description: 'Discover how a nonprofit program connects seniors to provide companionship and support to combat loneliness.',
    icon: Users,
    color: 'blue',
    readTime: '7 min read',
  },
  {
    id: 'understanding-disabilities',
    title: 'Understanding Disabilities: How to Cope With Them and Support Others Effectively',
    description: 'Explore the experiences of individuals with disabilities and learn how to support and interact respectfully.',
    icon: HandHeart,
    color: 'purple',
    readTime: '5 min read',
  },
  {
    id: 'technology-accessibility',
    title: 'How Common Technology Can Transform the Lives of People with Disabilities',
    description: 'Learn how smartphones and apps can significantly improve accessibility and quality of life.',
    icon: Smartphone,
    color: 'indigo',
    readTime: '6 min read',
  },
  {
    id: 'fall-prevention',
    title: 'How to Ensure Fall Prevention and Safety for Elderly Clients',
    description: 'Comprehensive measures to prevent falls and ensure safety for seniors in their homes.',
    icon: Shield,
    color: 'amber',
    readTime: '6 min read',
  },
  {
    id: 'virtual-reality-dementia',
    title: 'How Virtual Reality Programs are Revolutionizing Dementia Care',
    description: 'Explore how VR technology enhances well-being for individuals with dementia through immersive experiences.',
    icon: Brain,
    color: 'pink',
    readTime: '4 min read',
  },
  {
    id: 'exercise-seniors',
    title: 'How Regular Exercise Significantly Enhances Health and Quality of Life for Older Adults',
    description: 'Discover the numerous health benefits of physical activity for seniors aged 65 and above.',
    icon: Activity,
    color: 'green',
    readTime: '7 min read',
  },
];

// Article 1: Building Bridges
const BuildingBridgesContent = () => (
  <div className="prose prose-slate max-w-none">
    <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-lg mb-8">
      <p className="text-teal-800 font-medium m-0">
        <strong>Summary:</strong> This article explores the experiences of adults with developmental disabilities and offers guidance on how to interact with them respectfully and empathetically. It emphasizes seeing the person beyond their disability, communicating directly, allowing time for responses, and creating a supportive environment in healthcare and everyday interactions.
      </p>
    </div>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-teal-600" />
        Understanding the Person Beyond the Disability
      </h2>
      <p className="text-slate-700 leading-relaxed">
        Sometimes, one of the hardest things about having a disability is that people see the disability before they see you. This sentiment is shared by many individuals with developmental disabilities and their caregivers. For example, Antoine Smith is autistic and has visual impairments, but his disability does not define who he is. He is capable, able to love, and has a unique identity beyond his diagnosis.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <BookOpen className="w-6 h-6 text-teal-600" />
        Personal Stories and Perspectives
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        Antoine's sister and caregiver shares insights into his life and the challenges they face. She highlights the importance of recognizing the person first and not just their disability. Antoine enjoys learning, particularly math and spelling, and is pursuing higher education in psychology and neuroscience.
      </p>
      <p className="text-slate-700 leading-relaxed">
        Healthcare settings can be particularly challenging, as they often make individuals feel vulnerable. When Antoine visits the doctor, his sister notices that many people tend to talk to her instead of directly to Antoine. This can make him feel unseen and unheard.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <MessageCircle className="w-6 h-6 text-teal-600" />
        The Importance of Direct Communication
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        It is crucial to speak directly to the person with a disability, regardless of their communication abilities. If the individual does not understand, then it is appropriate to engage the caregiver. Approaching the situation with an open mind and respect is essential.
      </p>
      <p className="text-slate-700 leading-relaxed">
        For individuals with autism, predictability and clear communication help reduce anxiety. For instance, explaining who will be seen during a medical visit and what will happen can prepare them mentally and emotionally.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-teal-600" />
        Tips for Interacting with Adults with Developmental Disabilities
      </h2>
      <div className="bg-slate-50 rounded-xl p-6">
        <ul className="space-y-3 m-0 list-none p-0">
          {[
            'Always speak to the individual first.',
            'If necessary, involve the caregiver for clarification.',
            'Approach with an open mind and patience.',
            'Ask for permission before physical contact or approaching closely.',
            'Use clear, simple language and allow extra time for responses.',
            'Be mindful that some individuals may have difficulty reading facial expressions or may respond differently.',
          ].map((tip, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ChevronRight className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-slate-700">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-teal-600" />
        Recognizing the Similarities and Embracing Differences
      </h2>
      <p className="text-slate-700 leading-relaxed">
        People with developmental disabilities share many similarities with others. Some may exhibit behaviors such as stimming or avoiding eye contact, but these are just different ways of expressing themselves. Understanding and accepting these differences can lead to more meaningful connections.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <HandHeart className="w-6 h-6 text-teal-600" />
        The Power of Inclusion and Empathy
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        Inclusion makes a significant positive impact. Feeling included and accepted brings happiness and confidence. Caregivers and healthcare providers who respond with empathy and kindness help individuals feel safe and valued.
      </p>
      <p className="text-slate-700 leading-relaxed">
        When interacting with someone who is different, the best approach is to act normal and treat them with the same respect and dignity as anyone else. This simple act can make a profound difference.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Heart className="w-6 h-6 text-teal-600" />
        Investing in People with Disabilities
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        Embracing and supporting people with disabilities is an investment in their potential and humanity. It is about recognizing their abilities, perseverance, and courage.
      </p>
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-500 p-6 rounded-r-xl">
        <div className="flex gap-3">
          <Quote className="w-8 h-8 text-teal-400 flex-shrink-0" />
          <p className="text-lg text-teal-900 italic font-medium m-0">
            "The human spirit is one of ability, perseverance and courage, that no disability can steal away."
          </p>
        </div>
      </div>
    </section>

    <section className="mb-4">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-teal-600" />
        Conclusion
      </h2>
      <p className="text-slate-700 leading-relaxed">
        Building bridges with adults who have developmental disabilities requires seeing beyond the disability, communicating with respect, and fostering inclusion. By doing so, we honor their individuality and enrich our communities with diversity and understanding.
      </p>
    </section>

    <div className="text-sm text-slate-500 pt-4 border-t border-slate-200 mt-8">
      <p className="m-0">Source: Galaxy.ai YouTube Summarizer</p>
    </div>
  </div>
);

// Article 2: Seniors Helping Seniors
const SeniorsHelpingSeniorsContent = () => (
  <div className="prose prose-slate max-w-none">
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-8">
      <p className="text-blue-800 font-medium m-0">
        <strong>Summary:</strong> Loneliness affects over 40% of seniors, but a nonprofit called Aging Next is addressing this by having low-income seniors provide companionship to other seniors at risk of isolation. This senior companion care partner program fosters meaningful relationships, helps seniors remain in their homes, and offers vital social support through activities like grocery shopping, walks, and shared meals.
      </p>
    </div>

    <section className="mb-8">
      <p className="text-slate-700 leading-relaxed">
        Loneliness is a significant issue among the elderly, with more than 40% of seniors regularly experiencing it. While wrinkles and physical aging are often the visible signs of growing older, the emotional and social challenges can be far more impactful. Recognizing this, a local nonprofit organization called Aging Next has developed an innovative program that connects seniors with companionship and support, helping them age comfortably in their own homes.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-blue-600" />
        Aging Next and the Senior Companion Care Partner Program
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        Aging Next has been serving seniors for over 30 years, focusing on enabling them to remain independent and supported in their homes. One of their standout initiatives is the Senior Companion Care Partner Program. This program pairs low-income seniors with other seniors who are often on the verge of institutionalization due to social isolation or physical limitations.
      </p>
      <div className="bg-slate-50 rounded-xl p-6">
        <p className="text-slate-700 font-medium mb-3">The companions provide a variety of supportive services:</p>
        <ul className="space-y-2 m-0 list-none p-0">
          {[
            'Grocery shopping assistance',
            'Sharing meals together',
            'Going for walks',
            'Offering general companionship and friendship',
          ].map((service, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{service}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-slate-700 leading-relaxed mt-4">
        This peer-to-peer model is unique because it is seniors helping seniors, creating a bond of understanding and empathy that is difficult to replicate in other caregiving relationships.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Heart className="w-6 h-6 text-blue-600" />
        The Importance of Companionship for Seniors
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        Many seniors face social isolation as their families become dispersed and intergenerational homes become less common. The program addresses this gap by fostering neighborly support and friendship, which is crucial for mental and emotional well-being.
      </p>
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
        <div className="flex gap-3">
          <Quote className="w-8 h-8 text-blue-400 flex-shrink-0" />
          <p className="text-lg text-blue-900 italic font-medium m-0">
            "Many people are socially isolated as they're aging. This program gives an opportunity for a senior to just be a friend."
          </p>
        </div>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-blue-600" />
        Spotlight on a Senior Volunteer: Jackie Matthews
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        Jackie Matthews is a shining example of what it means to be a Senior Companion Care Partner. She has been volunteering with the program for six years and expresses a deep love for working with people.
      </p>
      <div className="bg-slate-50 rounded-xl p-6">
        <p className="text-slate-700 font-medium mb-3">Jackie's role includes:</p>
        <ul className="space-y-2 m-0 list-none p-0">
          {[
            'Setting up appointments for her companion, Seymour',
            'Taking out his garbage',
            'Spending quality time watching TV and talking',
          ].map((role, index) => (
            <li key={index} className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{role}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-slate-700 leading-relaxed mt-4">
        Their relationship is filled with humor and warmth, with Seymour often telling jokes and sharing lighthearted moments. Jackie's dedication and joyful spirit make her a role model for other volunteers.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Home className="w-6 h-6 text-blue-600" />
        The Changing Landscape of Senior Care
      </h2>
      <p className="text-slate-700 leading-relaxed">
        The program reflects broader societal changes. Decades ago, many families lived in intergenerational homes, providing built-in support for aging family members. Today, families are often spread across the country, making it harder for seniors to receive daily companionship and assistance. Programs like Aging Next's Senior Companion Care Partner fill this void by encouraging neighbors to help neighbors, creating a supportive community network.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Activity className="w-6 h-6 text-blue-600" />
        The Scale and Impact of the Program
      </h2>
      <p className="text-slate-700 leading-relaxed">
        Currently, Aging Next has 38 fixed-income senior volunteers providing companionship to approximately 135 seniors. This outreach not only helps prevent institutionalization but also enriches the lives of both the volunteers and those they assist.
      </p>
    </section>

    <section className="mb-4">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <HandHeart className="w-6 h-6 text-blue-600" />
        Conclusion
      </h2>
      <p className="text-slate-700 leading-relaxed">
        Loneliness among seniors is a pressing issue that requires compassionate and innovative solutions. Aging Next's Senior Companion Care Partner Program demonstrates how seniors themselves can be powerful agents of change, providing friendship, support, and practical help to their peers. Through programs like this, seniors can maintain their independence, enjoy meaningful social connections, and improve their quality of life.
      </p>
    </section>

    <div className="text-sm text-slate-500 pt-4 border-t border-slate-200 mt-8">
      <p className="m-0">Source: Galaxy.ai YouTube Summarizer</p>
    </div>
  </div>
);

// Article 3: Understanding Disabilities
const UnderstandingDisabilitiesContent = () => (
  <div className="prose prose-slate max-w-none">
    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg mb-8">
      <p className="text-purple-800 font-medium m-0">
        <strong>Summary:</strong> Disabilities vary widely in form, visibility, and impact, affecting movement, cognition, or sensory perception. This article explores the experiences of individuals with disabilities, like epilepsy, and offers guidance on how to support and interact respectfully with those who have disabilities. It emphasizes the importance of empathy, education, and counseling in fostering confidence and inclusion.
      </p>
    </div>

    <section className="mb-8">
      <p className="text-slate-700 leading-relaxed">
        When you hear the term disability, you might immediately think of a wheelchair. While it is true that some people with disabilities use wheelchairs, disabilities are much more diverse and not always visible. In fact, you cannot always tell if a person has a disability just by looking at them.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-purple-600" />
        The Variety of Disabilities
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        Disabilities come in many forms, varying in visibility and severity. They can affect:
      </p>
      <div className="bg-slate-50 rounded-xl p-6">
        <ul className="space-y-2 m-0 list-none p-0">
          {[
            'How a person moves',
            'How a person thinks',
            'How a person perceives the world through their senses',
          ].map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-slate-700 leading-relaxed mt-4">
        Some disabilities may involve a combination of these categories. Understanding this diversity is crucial to fostering empathy and support.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <BookOpen className="w-6 h-6 text-purple-600" />
        The Story of Felicia: Living with Epilepsy
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        Consider Felicia, who has epilepsy, a seizure disorder. Only her closest friends know about her condition. She experiences seizures occasionally and worries that her friends might treat her differently if they witness a seizure.
      </p>
      <p className="text-slate-700 leading-relaxed mb-4">
        This fear led Felicia to limit her activities to reduce the chances of having a seizure. Fortunately, her friends noticed this change and encouraged her to speak with the school counselor.
      </p>
      <p className="text-slate-700 leading-relaxed">
        With the counselor's help, Felicia found the courage to continue participating in activities despite the risk of seizures. Moreover, her friends, teachers, and coaches were educated on how to respond if a seizure occurs. This support system helped Felicia regain her confidence and live more fully.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <MessageCircle className="w-6 h-6 text-purple-600" />
        How to Interact Respectfully with People Who Have Disabilities
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        You may encounter people with disabilities at school, parks, or on sports teams without realizing it. It can be tempting to stare or ask questions, but it is important to approach such situations with respect.
      </p>
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-r-xl">
        <p className="text-purple-900 m-0">
          Some questions are appropriate if asked kindly. For example, asking <strong>"Can you tell me about your motor chair?"</strong> is much more considerate than asking <strong>"What is wrong with you?"</strong>
        </p>
      </div>
      <p className="text-slate-700 leading-relaxed mt-4">
        Respectful communication helps create an inclusive environment where people with disabilities feel valued and understood.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <HandHeart className="w-6 h-6 text-purple-600" />
        Support for People with Disabilities
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        If you have a disability, remember that support is available. There are people who understand or can relate to your experiences. While no two individuals have the exact same journey, connecting with others who share similar challenges can be comforting.
      </p>
      <p className="text-slate-700 leading-relaxed">
        Counselors can also provide valuable assistance by helping you process your feelings, frustrations, and thoughts. They can connect you with support groups and resources tailored to your needs.
      </p>
    </section>

    <section className="mb-4">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-purple-600" />
        Conclusion
      </h2>
      <p className="text-slate-700 leading-relaxed">
        Disabilities are diverse and often invisible. Understanding this helps us approach others with kindness and respect. Supporting individuals with disabilities involves education, empathy, and open communication. Whether you are a friend, family member, or community member, your support can make a significant difference in the lives of those living with disabilities.
      </p>
    </section>

    <div className="text-sm text-slate-500 pt-4 border-t border-slate-200 mt-8">
      <p className="m-0">Source: Galaxy.ai YouTube Summarizer</p>
    </div>
  </div>
);

// Article 4: Technology Accessibility
const TechnologyAccessibilityContent = () => (
  <div className="prose prose-slate max-w-none">
    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg mb-8">
      <p className="text-indigo-800 font-medium m-0">
        <strong>Summary:</strong> This article explores how common technology, such as smartphones and apps, can significantly improve the lives of people with disabilities. Inspired by a personal story of a friend with severe hearing loss, it highlights the development of a simple yet effective hearing enhancement app and discusses the broader social impact of technology in fostering accessibility and connection.
      </p>
    </div>

    <section className="mb-8">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-6 rounded-r-xl">
        <div className="flex gap-3">
          <Quote className="w-8 h-8 text-indigo-400 flex-shrink-0" />
          <p className="text-lg text-indigo-900 italic font-medium m-0">
            "If you want happiness for an hour, have a nap. If you want happiness for a day, go fishing. If you want happiness for a year, inherit a fortune. But if you want happiness for a lifetime, help somebody."
          </p>
        </div>
      </div>
      <p className="text-slate-700 leading-relaxed mt-4">
        This ancient Chinese wisdom perfectly encapsulates the motivation behind leveraging technology to assist people with disabilities.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Heart className="w-6 h-6 text-indigo-600" />
        A Personal Inspiration: Carol's Story
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        During my time at the Apple Developer Academy, I was asked a compelling question: How can we help people with disabilities through common technology? The first person who came to mind was my dear friend Carol. Despite our 48-year age difference, we quickly bonded. Carol was youthful, always smiling, and embraced every day as if it were her last.
      </p>
      <p className="text-slate-700 leading-relaxed mb-4">
        Carol was not only lively but also a technology wizard. She was adept at using computers, smartphones, and tablets. However, Carol faced a significant challenge: severe hearing loss. She was so hard of hearing that even when I shouted right next to her ear, she couldn't hear me. This hearing impairment made her feel embarrassed and limited. Her primary means of communication were video calls, text messages, and headphones.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Smartphone className="w-6 h-6 text-indigo-600" />
        Creating a Solution: The Hearing Enhancement App
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        This situation sparked an idea. What if we could create an app that uses the smartphone's microphone to pick up sounds and amplify them through headphones? Together with my team, we developed an app that works in three simple steps:
      </p>
      <div className="bg-slate-50 rounded-xl p-6">
        <ul className="space-y-3 m-0 list-none p-0">
          {[
            'It administers a hearing test to the user.',
            'It collects data on the user\'s hearing capabilities.',
            'It enhances the frequencies where the user has hearing weaknesses.',
          ].map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-indigo-600 font-bold text-sm">{index + 1}</span>
              </div>
              <span className="text-slate-700">{step}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-slate-700 leading-relaxed mt-4">
        This app is simple, functional, and tailored to individual needs, providing a practical solution for those with hearing impairments.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-indigo-600" />
        Technology's Role in Accessibility and Social Connection
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        There is an ongoing debate about whether technology isolates us or connects us. Some argue that technology leads to isolation because people are glued to their screens. Others believe technology fosters global communication and idea exchange.
      </p>
      <p className="text-slate-700 leading-relaxed mb-4">
        Personally, I acknowledge that technology can cause isolation, but I also recognize its vital role in improving accessibility. Thanks to common technology like smartphones and PCs, many people with disabilities can now access solutions that were previously out of reach, especially those who cannot afford professional help.
      </p>
      <p className="text-slate-700 leading-relaxed">
        This represents a social revolution. It is crucial to focus on designing technology that promotes social connection rather than just online interaction. Being socially connected is a fundamental human need.
      </p>
    </section>

    <section className="mb-4">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-indigo-600" />
        Conclusion
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        Technology, when thoughtfully applied, holds the power to transform lives by making the world more accessible and inclusive. Let us embrace this potential and design solutions that help others live fuller, happier lives.
      </p>
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-6 rounded-r-xl">
        <p className="text-lg text-indigo-900 font-medium m-0">
          Remember, if you want happiness for a lifetime, help somebody.
        </p>
      </div>
    </section>

    <div className="text-sm text-slate-500 pt-4 border-t border-slate-200 mt-8">
      <p className="m-0">Source: Galaxy.ai YouTube Summarizer</p>
    </div>
  </div>
);

// Article 5: Fall Prevention
const FallPreventionContent = () => (
  <div className="prose prose-slate max-w-none">
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-8">
      <p className="text-amber-800 font-medium m-0">
        <strong>Summary:</strong> Falls among seniors can lead to serious health complications. This article covers comprehensive measures to prevent falls and ensure safety for seniors, including assessing home environments, removing hazards, and providing personalized care with trusted caregivers who understand seniors' needs.
      </p>
    </div>

    <section className="mb-8">
      <p className="text-slate-700 leading-relaxed">
        Falls among seniors can lead to serious health complications, including broken bones, bruising, and even loss of independence. Recognizing the critical importance of fall prevention is essential for maintaining seniors' safety and well-being in their homes.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Home className="w-6 h-6 text-amber-600" />
        Assessing the Home Environment for Safety
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        When first meeting with a senior client, conduct a thorough assessment of the home environment. This evaluation focuses on identifying potential fall risks and making practical recommendations to mitigate them. For example, a common hazard is bathroom rugs, which can easily cause trips and falls, especially for seniors using walkers.
      </p>
      <div className="bg-slate-50 rounded-xl p-6">
        <p className="text-slate-700 font-medium mb-3">Areas of concern include:</p>
        <ul className="space-y-2 m-0 list-none p-0">
          {[
            { title: 'Rugs throughout the home', desc: 'Loose or unsecured rugs are a frequent fall risk. Consider removing rugs altogether.' },
            { title: 'Carpeting', desc: 'Carpets that are not tightly secured or properly stretched can cause trips.' },
            { title: 'Electrical cords', desc: 'Cords that run across walking paths can be dangerous and should be managed or removed.' },
            { title: 'Furniture arrangement', desc: 'Ensure there is enough space for mobility aids like walkers.' },
            { title: 'Furniture stability', desc: 'Lightweight or unstable furniture should be replaced with heavier, more stable pieces.' },
          ].map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-900 font-medium">{item.title}:</span>
                <span className="text-slate-700"> {item.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <HandHeart className="w-6 h-6 text-amber-600" />
        Personalized Care and Support
      </h2>
      <p className="text-slate-700 leading-relaxed">
        Beyond the physical environment, providing personalized care is essential. Caregivers often accompany clients on walks, both indoors and outdoors, to ensure safety while encouraging activity and independence. Tools such as gait belts provide balance support when needed, helping seniors enjoy their daily activities without fear of falling.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Clock className="w-6 h-6 text-amber-600" />
        Addressing Seasonal Challenges and Loneliness
      </h2>
      <p className="text-slate-700 leading-relaxed">
        Winter weather poses additional challenges for seniors, as icy or snowy conditions increase the risk of falls. After long winters, seniors may feel isolated and reluctant to go outside. To combat loneliness and promote physical activity, caregivers encourage safe movement and social interaction, helping seniors maintain their independence and mental well-being.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Heart className="w-6 h-6 text-amber-600" />
        Building Trust Through Experience and Respect
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        A key aspect of effective senior care is the trust and respect built with clients. Caregivers often have personal experience with falls or have cared for family members who have faced similar challenges. This firsthand knowledge allows them to offer empathetic and practical advice rather than simply instructing clients on what to do.
      </p>
      <p className="text-slate-700 leading-relaxed">
        Such experiences enable caregivers to connect with clients on a deeper level and provide support that feels genuine and caring.
      </p>
    </section>

    <section className="mb-4">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-amber-600" />
        Conclusion
      </h2>
      <p className="text-slate-700 leading-relaxed">
        Fall prevention is a vital component of senior care. Creating safe home environments and providing compassionate, personalized support helps seniors maintain their independence and quality of life. By addressing common hazards, encouraging safe activity, and fostering trusting relationships, caregivers can make a significant difference in the lives of elderly clients.
      </p>
    </section>

    <div className="text-sm text-slate-500 pt-4 border-t border-slate-200 mt-8">
      <p className="m-0">Source: Galaxy.ai YouTube Summarizer</p>
    </div>
  </div>
);

// Article 6: Virtual Reality Dementia
const VirtualRealityDementiaContent = () => (
  <div className="prose prose-slate max-w-none">
    <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded-r-lg mb-8">
      <p className="text-pink-800 font-medium m-0">
        <strong>Summary:</strong> Circle of Care's virtual reality program uses immersive technology to improve the well-being of individuals with dementia by transporting them to engaging virtual environments like concerts, travel destinations, and childhood neighborhoods, fostering emotional connection and cognitive stimulation.
      </p>
    </div>

    <section className="mb-8">
      <p className="text-slate-700 leading-relaxed">
        Circle of Care has developed an innovative virtual reality (VR) program designed to enhance the overall well-being of participants, particularly those living with dementia. This program leverages cutting-edge VR technology to create immersive experiences that engage users in meaningful and stimulating ways.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-pink-600" />
        How the Program Works
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        Participants in the program wear a VR headset that transports them into a virtual world. This immersive environment allows them to experience a variety of carefully selected videos and scenarios that cater to their interests and preferences.
      </p>
      <div className="bg-slate-50 rounded-xl p-6">
        <p className="text-slate-700 font-medium mb-3">Facilitators select content ranging from:</p>
        <ul className="space-y-2 m-0 list-none p-0">
          {[
            'Concerts and live music performances',
            'Unique travel destinations around the world',
            'Art museums and cultural experiences',
            'Scenes of babies and children playing',
            'Revisiting childhood neighborhoods',
            'Underwater ocean environments',
          ].map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Heart className="w-6 h-6 text-pink-600" />
        Benefits of Virtual Reality in Dementia Care
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        The use of VR in dementia care offers several benefits:
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-pink-50 rounded-xl p-4">
          <h3 className="font-semibold text-pink-900 mb-2">Emotional Engagement</h3>
          <p className="text-sm text-pink-800 m-0">
            By revisiting familiar places or experiencing joyful scenes, participants can connect emotionally, which may help reduce feelings of isolation or anxiety.
          </p>
        </div>
        <div className="bg-pink-50 rounded-xl p-4">
          <h3 className="font-semibold text-pink-900 mb-2">Cognitive Stimulation</h3>
          <p className="text-sm text-pink-800 m-0">
            Exploring new environments or recalling past memories through virtual experiences can stimulate cognitive functions and potentially slow cognitive decline.
          </p>
        </div>
        <div className="bg-pink-50 rounded-xl p-4">
          <h3 className="font-semibold text-pink-900 mb-2">Enhanced Well-Being</h3>
          <p className="text-sm text-pink-800 m-0">
            The immersive nature of VR provides a sense of escapism and enjoyment, contributing positively to the participants' overall mental health.
          </p>
        </div>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-pink-600" />
        The Role of Facilitators
      </h2>
      <p className="text-slate-700 leading-relaxed">
        Facilitators are essential to the success of the program. They personalize the VR experience by selecting content that aligns with the interests and histories of the participants. This personalized approach ensures that each session is meaningful and engaging, maximizing the therapeutic benefits of the technology.
      </p>
    </section>

    <section className="mb-4">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-pink-600" />
        Conclusion
      </h2>
      <p className="text-slate-700 leading-relaxed">
        This pioneering approach demonstrates the potential of virtual reality to transform healthcare practices and offers hope for more engaging and effective dementia care solutions in the future. By providing immersive, personalized experiences, the program not only enhances the quality of life for participants but also opens new avenues for therapeutic interventions in cognitive health.
      </p>
    </section>

    <div className="text-sm text-slate-500 pt-4 border-t border-slate-200 mt-8">
      <p className="m-0">Source: Galaxy.ai YouTube Summarizer</p>
    </div>
  </div>
);

// Article 7: Exercise for Seniors
const ExerciseSeniorsContent = () => (
  <div className="prose prose-slate max-w-none">
    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-8">
      <p className="text-green-800 font-medium m-0">
        <strong>Summary:</strong> Regular physical activity is crucial for adults aged 65 and older, offering numerous health benefits including reduced risks of chronic diseases, improved brain function, better mental health, and enhanced social connections. It is never too late to start exercising.
      </p>
    </div>

    <section className="mb-8">
      <p className="text-slate-700 leading-relaxed">
        Physical activity is a vital component of a healthy lifestyle, especially for older adults aged 65 and above. Engaging in regular exercise not only improves physical health but also enhances overall quality of life, helping seniors maintain independence and stay in their homes longer.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Activity className="w-6 h-6 text-green-600" />
        Recommended Physical Activity Guidelines
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        Health experts recommend that older adults aim for the following weekly physical activity targets:
      </p>
      <div className="bg-slate-50 rounded-xl p-6">
        <ul className="space-y-2 m-0 list-none p-0">
          {[
            'At least 150 minutes of moderate to vigorous aerobic exercise',
            'Muscle strengthening exercises at least twice per week',
            'Several hours of light physical activity such as standing or walking',
            'Balance exercises to challenge stability',
            'Limiting sedentary time to eight hours or less per day',
            'Breaking up long periods of sitting as often as possible',
            'Consistent sleep of 7 to 8 hours each night',
          ].map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Heart className="w-6 h-6 text-green-600" />
        Understanding Aerobic Activities
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        Aerobic activities involve continuous movements that increase your heart rate and breathing. These exercises make you feel warm and cause you to breathe deeply. Examples include:
      </p>
      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <div className="bg-green-50 rounded-xl p-4">
          <h3 className="font-semibold text-green-900 mb-2">Moderate Level</h3>
          <p className="text-sm text-green-800 m-0">
            Your heart beats faster and you breathe harder, but you can still talk (though not sing). For example, fast walking.
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <h3 className="font-semibold text-green-900 mb-2">Vigorous Level</h3>
          <p className="text-sm text-green-800 m-0">
            Your heart rate increases to the point where you can only say a few words without pausing for breath. For example, jogging.
          </p>
        </div>
      </div>
      <p className="text-slate-700 leading-relaxed">
        Examples of aerobic activities include pushing a lawn mower, taking a dance class, biking, and fast walking.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-green-600" />
        Health Benefits Supported by Research
      </h2>
      <div className="bg-slate-50 rounded-xl p-6">
        <p className="text-slate-700 font-medium mb-4">According to research, regular physical activity can lead to:</p>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            '20-30% reduced risk of depression and dementia',
            '20-35% reduced risk of cardiovascular disease',
            '20% reduced risk of breast cancer',
            '20-40% reduced risk of type 2 diabetes',
            '30% reduced risk of colon cancer',
            '30% reduced risk of falling',
          ].map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-slate-700 leading-relaxed mt-4">
        Additionally, exercise helps reduce pain, increase muscle strength and joint stability, improve balance, and enhance general health, well-being, sleep quality, and mood.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-green-600" />
        Benefits for Brain and Mental Health
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        Exercise positively impacts brain health by improving memory, enhancing overall brain function, and increasing cognitive abilities. Physical activity can also improve mood, boost self-esteem, and reduce symptoms of depression.
      </p>
      <p className="text-slate-700 leading-relaxed">
        Exercising provides opportunities for social interaction, which helps decrease feelings of loneliness and improves social connectedness.
      </p>
    </section>

    <section className="mb-4">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Lightbulb className="w-6 h-6 text-green-600" />
        Starting Exercise at Any Age
      </h2>
      <p className="text-slate-700 leading-relaxed mb-4">
        It is never too late to begin exercising, even within the comfort of your own home. For those interested in virtual or in-person exercise or falls prevention classes, resources are available to support safe and effective physical activity.
      </p>
      <div className="bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500 p-6 rounded-r-xl">
        <p className="text-lg text-green-900 font-medium m-0">
          In conclusion, regular physical activity is essential for older adults to maintain health, independence, and quality of life. By following recommended exercise guidelines, seniors can experience profound benefits that extend beyond physical health to mental and social well-being.
        </p>
      </div>
    </section>

    <div className="text-sm text-slate-500 pt-4 border-t border-slate-200 mt-8">
      <p className="m-0">Source: Galaxy.ai YouTube Summarizer</p>
    </div>
  </div>
);

// Map article IDs to their content components
const articleContentMap = {
  'building-bridges': BuildingBridgesContent,
  'seniors-helping-seniors': SeniorsHelpingSeniorsContent,
  'understanding-disabilities': UnderstandingDisabilitiesContent,
  'technology-accessibility': TechnologyAccessibilityContent,
  'fall-prevention': FallPreventionContent,
  'virtual-reality-dementia': VirtualRealityDementiaContent,
  'exercise-seniors': ExerciseSeniorsContent,
};

// Color mapping for article cards
const colorClasses = {
  teal: { bg: 'bg-teal-100', hoverBg: 'group-hover:bg-teal-200', icon: 'text-teal-600', header: 'from-teal-50 to-cyan-50', border: 'border-teal-500' },
  blue: { bg: 'bg-blue-100', hoverBg: 'group-hover:bg-blue-200', icon: 'text-blue-600', header: 'from-blue-50 to-cyan-50', border: 'border-blue-500' },
  purple: { bg: 'bg-purple-100', hoverBg: 'group-hover:bg-purple-200', icon: 'text-purple-600', header: 'from-purple-50 to-pink-50', border: 'border-purple-500' },
  indigo: { bg: 'bg-indigo-100', hoverBg: 'group-hover:bg-indigo-200', icon: 'text-indigo-600', header: 'from-indigo-50 to-purple-50', border: 'border-indigo-500' },
  amber: { bg: 'bg-amber-100', hoverBg: 'group-hover:bg-amber-200', icon: 'text-amber-600', header: 'from-amber-50 to-orange-50', border: 'border-amber-500' },
  pink: { bg: 'bg-pink-100', hoverBg: 'group-hover:bg-pink-200', icon: 'text-pink-600', header: 'from-pink-50 to-rose-50', border: 'border-pink-500' },
  green: { bg: 'bg-green-100', hoverBg: 'group-hover:bg-green-200', icon: 'text-green-600', header: 'from-green-50 to-teal-50', border: 'border-green-500' },
};

export default function Resources() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  if (selectedArticle) {
    const ArticleContent = articleContentMap[selectedArticle.id];
    const colors = colorClasses[selectedArticle.color] || colorClasses.teal;

    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-6 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Resources
          </button>

          {/* Article Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className={`border-b border-slate-100 bg-gradient-to-r ${colors.header}`}>
              <div className="flex items-center gap-2 text-teal-600 text-sm font-medium mb-2">
                <Clock className="w-4 h-4" />
                {selectedArticle.readTime}
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900">
                {selectedArticle.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              {ArticleContent && <ArticleContent />}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Resources</h1>
          <p className="text-slate-600">
            Helpful guides and articles to support your caregiving journey.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            Featured Articles
          </h2>

          <div className="grid gap-4">
            {articles.map((article) => {
              const IconComponent = article.icon;
              const colors = colorClasses[article.color] || colorClasses.teal;
              return (
                <Card
                  key={article.id}
                  className="border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setSelectedArticle(article)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0 ${colors.hoverBg} transition-colors`}>
                        <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                          <Clock className="w-4 h-4" />
                          {article.readTime}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-slate-600 text-sm">
                          {article.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Coming Soon */}
        <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-slate-50 to-teal-50">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-8 h-8 text-teal-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-1">More Resources Coming Soon</h3>
            <p className="text-sm text-slate-600">
              We're adding more helpful guides for caregivers. Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

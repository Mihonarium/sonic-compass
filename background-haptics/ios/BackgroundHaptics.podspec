require 'json'
package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'BackgroundHaptics'
  s.version      = package['version']
  s.summary      = package['description']
  s.description  = package['description']
  s.license      = package['license']
  s.author       = package['author']
  s.platforms    = { ios: '15.1' }
  s.source       = { git: 'https://example.com/BackgroundHaptics.git' }
  s.static_framework = true
  s.source_files  = '**/*.{h,m,swift}'
  s.dependency 'ExpoModulesCore'
  s.swift_version = '5.4'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end

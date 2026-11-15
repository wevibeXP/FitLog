Pod::Spec.new do |s|
  s.name           = 'FitlogMotion'
  s.version        = '1.0.0'
  s.summary        = 'Native Core Motion pedometer bridge for Fitlog'
  s.description    = 'Exposes iPhone steps, walking distance, pace, cadence and floor counts through CMPedometer.'
  s.author         = 'Fitlog'
  s.homepage       = 'https://github.com/wevibeXP/FitLog'
  s.license        = { :type => 'MIT' }
  s.source         = { :git => 'https://github.com/wevibeXP/FitLog.git' }
  s.ios.deployment_target = '15.1'
  s.swift_version  = '5.9'
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift}"
end
